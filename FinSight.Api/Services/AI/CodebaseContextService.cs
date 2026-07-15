using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;

namespace FinSight.Api.Services.AI;

public class CodebaseContextService : ICodebaseContextService
{
    private readonly IAiGuardrailService _guardrailService;

    public CodebaseContextService(IAiGuardrailService guardrailService)
    {
        _guardrailService = guardrailService;
    }

    public Task<CodebaseAnalysisResponse> AnalyzeCodebaseAsync(
        CodebaseAnalysisRequest request,
        CancellationToken cancellationToken = default)
    {
        var guardrails = _guardrailService.GetCurrentGuardrails();

        var rootPath = string.IsNullOrWhiteSpace(request.RepoRoot)
            ? Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), ".."))
            : Path.GetFullPath(request.RepoRoot);

        var maxFiles = Math.Min(request.MaxFiles ?? guardrails.MaxFilesToScan, guardrails.MaxFilesToScan);

        var response = new CodebaseAnalysisResponse
        {
            RootPath = rootPath
        };

        if (!Directory.Exists(rootPath))
        {
            response.Warnings.Add($"Repo root was not found: {rootPath}");
            return Task.FromResult(response);
        }

        var extensions = request.IncludeExtensions
            .Select(extension => extension.StartsWith(".") ? extension : "." + extension)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var files = Directory
            .EnumerateFiles(rootPath, "*.*", SearchOption.AllDirectories)
            .Where(file => extensions.Contains(Path.GetExtension(file)))
            .Where(file => !_guardrailService.IsPathProtected(file))
            .Take(maxFiles)
            .ToList();

        response.FilesScanned = files.Count;
        response.CandidateFiles = files
            .Select(file => Path.GetRelativePath(rootPath, file))
            .Take(50)
            .ToList();

        foreach (var file in files)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var relative = Path.GetRelativePath(rootPath, file);
            var fileName = Path.GetFileName(file);

            if (relative.Contains("Controllers", StringComparison.OrdinalIgnoreCase))
            {
                response.ProjectPatterns.Add("API controller pattern detected under Controllers.");
            }

            if (relative.Contains("DTOs", StringComparison.OrdinalIgnoreCase))
            {
                response.ProjectPatterns.Add("DTO contract pattern detected under Core/DTOs.");
            }

            if (relative.Contains("Interfaces", StringComparison.OrdinalIgnoreCase))
            {
                response.ProjectPatterns.Add("Interface-driven service boundary pattern detected.");
            }

            if (relative.Contains("features", StringComparison.OrdinalIgnoreCase) &&
                relative.EndsWith(".tsx", StringComparison.OrdinalIgnoreCase))
            {
                response.ProjectPatterns.Add("React feature-folder page/component pattern detected.");
            }

            if (fileName.EndsWith("Controller.cs", StringComparison.OrdinalIgnoreCase))
            {
                response.NamingConventions.Add("API controllers use *Controller.cs naming.");
            }

            if (fileName.EndsWith("Service.cs", StringComparison.OrdinalIgnoreCase))
            {
                response.NamingConventions.Add("Services use *Service.cs naming.");
            }

            if (fileName.EndsWith("Page.tsx", StringComparison.OrdinalIgnoreCase))
            {
                response.NamingConventions.Add("React pages use *Page.tsx naming.");
            }

            TryCollectReusableMethods(file, response);
        }

        response.ProjectPatterns = response.ProjectPatterns.Distinct().ToList();
        response.NamingConventions = response.NamingConventions.Distinct().ToList();
        response.ExistingMethodsToReuse = response.ExistingMethodsToReuse.Distinct().Take(40).ToList();

        response.Warnings.Add("Analysis excludes protected paths and treats generated output as a reviewable proposal.");

        return Task.FromResult(response);
    }

    private static void TryCollectReusableMethods(string file, CodebaseAnalysisResponse response)
    {
        try
        {
            foreach (var line in File.ReadLines(file).Take(300))
            {
                var trimmed = line.Trim();

                if (trimmed.StartsWith("public ") &&
                    trimmed.Contains("(") &&
                    trimmed.Contains(")") &&
                    !trimmed.Contains(" class "))
                {
                    response.ExistingMethodsToReuse.Add($"{Path.GetFileName(file)}: {trimmed}");
                }

                if (trimmed.StartsWith("function ") &&
                    trimmed.Contains("(") &&
                    trimmed.Contains(")"))
                {
                    response.ExistingMethodsToReuse.Add($"{Path.GetFileName(file)}: {trimmed}");
                }

                if (trimmed.StartsWith("export async function ") ||
                    trimmed.StartsWith("export function "))
                {
                    response.ExistingMethodsToReuse.Add($"{Path.GetFileName(file)}: {trimmed}");
                }
            }
        }
        catch
        {
            response.Warnings.Add($"Unable to inspect file: {file}");
        }
    }
}
