$ErrorActionPreference = "Stop"

$repoRoot = "C:\work\source\repos\FinSight"

Set-Location $repoRoot

Write-Host "Adding FinSight enterprise AI guardrail and agentic planning features..." -ForegroundColor Cyan

# ------------------------------------------------------------
# Create folders
# ------------------------------------------------------------

$folders = @(
    "FinSight.Core\DTOs\AI",
    "FinSight.Core\Interfaces",
    "FinSight.Api\Services\AI",
    "FinSight.Api\Controllers",
    "FinSight.Web\src\features\mlai\types",
    "FinSight.Web\src\features\mlai\api",
    "docs"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# ------------------------------------------------------------
# Core DTOs
# ------------------------------------------------------------

@'
namespace FinSight.Core.DTOs.AI;

public class AiGuardrailConfigResponse
{
    public bool HumanReviewRequired { get; set; }
    public bool AllowCodeGeneration { get; set; }
    public bool AllowFileWriteBack { get; set; }
    public bool AllowDocumentationProposals { get; set; }
    public int MaxFilesToScan { get; set; }
    public List<string> ProtectedPaths { get; set; } = new();
    public List<string> BlockedTerms { get; set; } = new();
    public List<string> ApprovedUseCases { get; set; } = new();
    public List<string> GuardrailsApplied { get; set; } = new();
    public DateTime LoadedAtUtc { get; set; } = DateTime.UtcNow;
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\AiGuardrailConfigResponse.cs" -Encoding UTF8

@'
namespace FinSight.Core.DTOs.AI;

public class CodebaseAnalysisRequest
{
    public string? RepoRoot { get; set; }
    public int? MaxFiles { get; set; }

    public List<string> IncludeExtensions { get; set; } = new()
    {
        ".cs",
        ".tsx",
        ".ts",
        ".md",
        ".json"
    };
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\CodebaseAnalysisRequest.cs" -Encoding UTF8

@'
namespace FinSight.Core.DTOs.AI;

public class CodebaseAnalysisResponse
{
    public string RootPath { get; set; } = string.Empty;
    public int FilesScanned { get; set; }
    public List<string> ProjectPatterns { get; set; } = new();
    public List<string> ExistingMethodsToReuse { get; set; } = new();
    public List<string> NamingConventions { get; set; } = new();
    public List<string> CandidateFiles { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public DateTime AnalyzedAtUtc { get; set; } = DateTime.UtcNow;
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\CodebaseAnalysisResponse.cs" -Encoding UTF8

@'
namespace FinSight.Core.DTOs.AI;

public class FeatureGenerationRequest
{
    public string FeatureName { get; set; } = string.Empty;
    public string BusinessGoal { get; set; } = string.Empty;
    public string TargetArea { get; set; } = string.Empty;
    public List<string> Requirements { get; set; } = new();
    public bool ReuseExistingMethodsFirst { get; set; } = true;
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\FeatureGenerationRequest.cs" -Encoding UTF8

@'
namespace FinSight.Core.DTOs.AI;

public class FeatureGenerationResponse
{
    public string Summary { get; set; } = string.Empty;
    public List<string> ExistingMethodsToReuse { get; set; } = new();
    public List<string> ProposedServiceBoundaries { get; set; } = new();
    public List<string> ProposedFiles { get; set; } = new();
    public List<string> ImplementationSteps { get; set; } = new();
    public List<string> TestPlan { get; set; } = new();
    public List<string> GuardrailsApplied { get; set; } = new();
    public DateTime GeneratedAtUtc { get; set; } = DateTime.UtcNow;
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\FeatureGenerationResponse.cs" -Encoding UTF8

@'
namespace FinSight.Core.DTOs.AI;

public class DocumentationUpdateRequest
{
    public string Topic { get; set; } = string.Empty;
    public string ChangeSummary { get; set; } = string.Empty;
    public string TargetDocumentName { get; set; } = "docs/generated-ai-proposal.md";
    public bool MatchExistingDocumentationStyle { get; set; } = true;
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\DocumentationUpdateRequest.cs" -Encoding UTF8

@'
namespace FinSight.Core.DTOs.AI;

public class DocumentationUpdateResponse
{
    public string TargetDocumentName { get; set; } = string.Empty;
    public string ProposedMarkdown { get; set; } = string.Empty;
    public List<string> ExistingDocumentationSignals { get; set; } = new();
    public List<string> NamingConventionNotes { get; set; } = new();
    public List<string> GuardrailsApplied { get; set; } = new();
    public DateTime GeneratedAtUtc { get; set; } = DateTime.UtcNow;
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\DocumentationUpdateResponse.cs" -Encoding UTF8

# ------------------------------------------------------------
# Core Interfaces
# ------------------------------------------------------------

@'
using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface IAiGuardrailService
{
    AiGuardrailConfigResponse GetCurrentGuardrails();
    bool IsPathProtected(string path);
}
'@ | Set-Content -Path "FinSight.Core\Interfaces\IAiGuardrailService.cs" -Encoding UTF8

@'
using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface ICodebaseContextService
{
    Task<CodebaseAnalysisResponse> AnalyzeCodebaseAsync(
        CodebaseAnalysisRequest request,
        CancellationToken cancellationToken = default);
}
'@ | Set-Content -Path "FinSight.Core\Interfaces\ICodebaseContextService.cs" -Encoding UTF8

@'
using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface IAgenticFeaturePlanningService
{
    Task<FeatureGenerationResponse> GenerateFeaturePlanAsync(
        FeatureGenerationRequest request,
        CancellationToken cancellationToken = default);
}
'@ | Set-Content -Path "FinSight.Core\Interfaces\IAgenticFeaturePlanningService.cs" -Encoding UTF8

@'
using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface IDocumentationProposalService
{
    Task<DocumentationUpdateResponse> GenerateDocumentationProposalAsync(
        DocumentationUpdateRequest request,
        CancellationToken cancellationToken = default);
}
'@ | Set-Content -Path "FinSight.Core\Interfaces\IDocumentationProposalService.cs" -Encoding UTF8

# ------------------------------------------------------------
# API Services
# ------------------------------------------------------------

@'
using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;

namespace FinSight.Api.Services.AI;

public class AiGuardrailService : IAiGuardrailService
{
    private readonly IConfiguration _configuration;

    public AiGuardrailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public AiGuardrailConfigResponse GetCurrentGuardrails()
    {
        var section = _configuration.GetSection("AiGuardrails");

        var response = new AiGuardrailConfigResponse
        {
            HumanReviewRequired = section.GetValue("HumanReviewRequired", true),
            AllowCodeGeneration = section.GetValue("AllowCodeGeneration", true),
            AllowFileWriteBack = section.GetValue("AllowFileWriteBack", false),
            AllowDocumentationProposals = section.GetValue("AllowDocumentationProposals", true),
            MaxFilesToScan = section.GetValue("MaxFilesToScan", 150),
            ProtectedPaths = section.GetSection("ProtectedPaths").Get<List<string>>() ?? new()
            {
                ".git",
                "bin",
                "obj",
                "node_modules",
                "dist",
                "appsettings.Production.json",
                "secrets",
                ".env"
            },
            BlockedTerms = section.GetSection("BlockedTerms").Get<List<string>>() ?? new()
            {
                "password",
                "secret",
                "private key",
                "connection string",
                "token"
            },
            ApprovedUseCases = section.GetSection("ApprovedUseCases").Get<List<string>>() ?? new()
            {
                "codebase analysis",
                "feature planning",
                "test planning",
                "documentation proposal",
                "refactoring recommendation",
                "operational troubleshooting support"
            }
        };

        response.GuardrailsApplied = new()
        {
            "Human review is required before code or documentation changes are committed.",
            "Protected paths are excluded from scanning.",
            "Secrets and credentials must not be included in generated prompts or documentation.",
            "Generated output is treated as a proposal, not an autonomous production change.",
            "Existing project conventions must be reused before introducing new patterns."
        };

        return response;
    }

    public bool IsPathProtected(string path)
    {
        var guardrails = GetCurrentGuardrails();

        return guardrails.ProtectedPaths.Any(protectedPath =>
            path.Contains(protectedPath, StringComparison.OrdinalIgnoreCase));
    }
}
'@ | Set-Content -Path "FinSight.Api\Services\AI\AiGuardrailService.cs" -Encoding UTF8

@'
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
            ? Directory.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), ".."))
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
'@ | Set-Content -Path "FinSight.Api\Services\AI\CodebaseContextService.cs" -Encoding UTF8

@'
using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;

namespace FinSight.Api.Services.AI;

public class AgenticFeaturePlanningService : IAgenticFeaturePlanningService
{
    private readonly IAiGuardrailService _guardrailService;
    private readonly ICodebaseContextService _codebaseContextService;

    public AgenticFeaturePlanningService(
        IAiGuardrailService guardrailService,
        ICodebaseContextService codebaseContextService)
    {
        _guardrailService = guardrailService;
        _codebaseContextService = codebaseContextService;
    }

    public async Task<FeatureGenerationResponse> GenerateFeaturePlanAsync(
        FeatureGenerationRequest request,
        CancellationToken cancellationToken = default)
    {
        var guardrails = _guardrailService.GetCurrentGuardrails();

        var codebase = await _codebaseContextService.AnalyzeCodebaseAsync(
            new CodebaseAnalysisRequest
            {
                MaxFiles = 150
            },
            cancellationToken);

        var featureSlug = ToSafeName(request.FeatureName);

        var response = new FeatureGenerationResponse
        {
            Summary = $"Generated a reuse-first implementation plan for {request.FeatureName}. This is a reviewable engineering proposal, not an autonomous file write.",
            ExistingMethodsToReuse = codebase.ExistingMethodsToReuse.Take(12).ToList(),
            ProposedServiceBoundaries = new()
            {
                "DTO contract in FinSight.Core/DTOs.",
                "Interface contract in FinSight.Core/Interfaces.",
                "Implementation service behind the interface.",
                "ASP.NET Core controller endpoint using the existing auth and role model.",
                "React feature page under FinSight.Web/src/features using existing API/page/type conventions.",
                "Tests for service rules, API contract behavior, and frontend interaction."
            },
            ProposedFiles = new()
            {
                $"FinSight.Core/DTOs/{featureSlug}/{featureSlug}Request.cs",
                $"FinSight.Core/DTOs/{featureSlug}/{featureSlug}Response.cs",
                $"FinSight.Core/Interfaces/I{featureSlug}Service.cs",
                $"FinSight.Api/Controllers/{featureSlug}Controller.cs",
                $"FinSight.Web/src/features/{featureSlug.ToLowerInvariant()}/api/{featureSlug.ToLowerInvariant()}Api.ts",
                $"FinSight.Web/src/features/{featureSlug.ToLowerInvariant()}/types/{featureSlug.ToLowerInvariant()}Types.ts",
                $"FinSight.Web/src/features/{featureSlug.ToLowerInvariant()}/pages/{featureSlug}Page.tsx",
                $"docs/{featureSlug.ToLowerInvariant()}-implementation-notes.md"
            },
            ImplementationSteps = new()
            {
                "Analyze existing controllers, services, DTOs, and React feature folders before creating new patterns.",
                "Define request and response DTOs first so the API contract is explicit.",
                "Create an interface before the implementation so the feature remains testable and replaceable.",
                "Reuse existing auth, API client, page layout, card, table, and error-handling patterns.",
                "Add route and navbar entry using the current route/nav structure.",
                "Add service-level tests and at least one API contract test.",
                "Build backend project and React frontend separately using the repo-specific build process."
            },
            TestPlan = new()
            {
                "Service unit test for happy path.",
                "Service unit test for validation failure.",
                "API test for unauthorized access.",
                "API test for role-authorized access.",
                "Frontend build validation.",
                "Manual end-to-end validation through the React page."
            },
            GuardrailsApplied = guardrails.GuardrailsApplied
        };

        if (!request.ReuseExistingMethodsFirst)
        {
            response.GuardrailsApplied.Add("Warning: request did not require existing-method reuse first. Enterprise default remains reuse-first.");
        }

        return response;
    }

    private static string ToSafeName(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return "GeneratedFeature";
        }

        var safe = new string(value.Where(char.IsLetterOrDigit).ToArray());

        return string.IsNullOrWhiteSpace(safe)
            ? "GeneratedFeature"
            : safe;
    }
}
'@ | Set-Content -Path "FinSight.Api\Services\AI\AgenticFeaturePlanningService.cs" -Encoding UTF8

@'
using System.Text;
using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;

namespace FinSight.Api.Services.AI;

public class DocumentationProposalService : IDocumentationProposalService
{
    private readonly IAiGuardrailService _guardrailService;

    public DocumentationProposalService(IAiGuardrailService guardrailService)
    {
        _guardrailService = guardrailService;
    }

    public Task<DocumentationUpdateResponse> GenerateDocumentationProposalAsync(
        DocumentationUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var guardrails = _guardrailService.GetCurrentGuardrails();

        var response = new DocumentationUpdateResponse
        {
            TargetDocumentName = request.TargetDocumentName,
            GuardrailsApplied = guardrails.GuardrailsApplied,
            ExistingDocumentationSignals = DetectDocumentationSignals(),
            NamingConventionNotes = new()
            {
                "Use kebab-case for markdown files under docs.",
                "Use clear H1/H2/H3 headings.",
                "Describe enterprise purpose, architecture, current behavior, guardrails, and future enhancements.",
                "Avoid secrets, credentials, connection strings, or customer data in generated documentation."
            }
        };

        var markdown = new StringBuilder();

        markdown.AppendLine($"# {request.Topic}");
        markdown.AppendLine();
        markdown.AppendLine("## Purpose");
        markdown.AppendLine();
        markdown.AppendLine(request.ChangeSummary);
        markdown.AppendLine();
        markdown.AppendLine("## Enterprise Context");
        markdown.AppendLine();
        markdown.AppendLine("This documentation follows the FinSight convention of explaining the business purpose, architecture, implementation behavior, and operational guardrails for each feature.");
        markdown.AppendLine();
        markdown.AppendLine("## Proposed Implementation Notes");
        markdown.AppendLine();
        markdown.AppendLine("- Reuse existing service boundaries before adding new patterns.");
        markdown.AppendLine("- Keep API contracts explicit through DTOs.");
        markdown.AppendLine("- Keep generated output reviewable by engineers.");
        markdown.AppendLine("- Require human approval before production-impacting changes.");
        markdown.AppendLine("- Validate implementation through backend and frontend builds.");
        markdown.AppendLine();
        markdown.AppendLine("## Guardrails");
        markdown.AppendLine();

        foreach (var guardrail in guardrails.GuardrailsApplied)
        {
            markdown.AppendLine($"- {guardrail}");
        }

        markdown.AppendLine();
        markdown.AppendLine("## Future Enhancements");
        markdown.AppendLine();
        markdown.AppendLine("- Add automated tests around this workflow.");
        markdown.AppendLine("- Add operational logging and auditability.");
        markdown.AppendLine("- Add CI/CD validation gates.");
        markdown.AppendLine("- Add reviewer approval before generated code or documentation is committed.");

        response.ProposedMarkdown = markdown.ToString();

        return Task.FromResult(response);
    }

    private static List<string> DetectDocumentationSignals()
    {
        var signals = new List<string>();

        if (Directory.Exists("docs"))
        {
            signals.Add("docs folder detected.");
        }

        if (File.Exists("README.md"))
        {
            signals.Add("README.md detected as primary project summary.");
        }

        signals.Add("Documentation proposals should match the existing concise markdown style.");

        return signals;
    }
}
'@ | Set-Content -Path "FinSight.Api\Services\AI\DocumentationProposalService.cs" -Encoding UTF8

# ------------------------------------------------------------
# Expanded Controller
# ------------------------------------------------------------

@'
using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSight.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Analyst,Auditor")]
[Route("api/[controller]")]
public class MlAiController : ControllerBase
{
    private readonly IMlRiskScoringService _riskScoringService;
    private readonly IEnterpriseAiInsightService _aiInsightService;
    private readonly IAiGuardrailService _guardrailService;
    private readonly ICodebaseContextService _codebaseContextService;
    private readonly IAgenticFeaturePlanningService _featurePlanningService;
    private readonly IDocumentationProposalService _documentationProposalService;

    public MlAiController(
        IMlRiskScoringService riskScoringService,
        IEnterpriseAiInsightService aiInsightService,
        IAiGuardrailService guardrailService,
        ICodebaseContextService codebaseContextService,
        IAgenticFeaturePlanningService featurePlanningService,
        IDocumentationProposalService documentationProposalService)
    {
        _riskScoringService = riskScoringService;
        _aiInsightService = aiInsightService;
        _guardrailService = guardrailService;
        _codebaseContextService = codebaseContextService;
        _featurePlanningService = featurePlanningService;
        _documentationProposalService = documentationProposalService;
    }

    [HttpGet("guardrails")]
    public ActionResult<AiGuardrailConfigResponse> GetGuardrails()
    {
        return Ok(_guardrailService.GetCurrentGuardrails());
    }

    [HttpPost("transaction-risk")]
    public async Task<ActionResult<TransactionRiskPredictionResponse>> ScoreTransactionRisk(
        TransactionRiskPredictionRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Amount <= 0)
        {
            return BadRequest("Amount must be greater than zero.");
        }

        var result = await _riskScoringService.ScoreTransactionRiskAsync(request, cancellationToken);

        return Ok(result);
    }

    [HttpPost("enterprise-insight")]
    public async Task<ActionResult<EnterpriseAiInsightResponse>> GenerateEnterpriseInsight(
        EnterpriseAiInsightRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UserQuestion) &&
            string.IsNullOrWhiteSpace(request.Scenario))
        {
            return BadRequest("Scenario or user question is required.");
        }

        var result = await _aiInsightService.GenerateInsightAsync(request, cancellationToken);

        return Ok(result);
    }

    [HttpPost("codebase/analyze")]
    public async Task<ActionResult<CodebaseAnalysisResponse>> AnalyzeCodebase(
        CodebaseAnalysisRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _codebaseContextService.AnalyzeCodebaseAsync(request, cancellationToken);

        return Ok(result);
    }

    [HttpPost("feature-plan")]
    public async Task<ActionResult<FeatureGenerationResponse>> GenerateFeaturePlan(
        FeatureGenerationRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.FeatureName))
        {
            return BadRequest("Feature name is required.");
        }

        var result = await _featurePlanningService.GenerateFeaturePlanAsync(request, cancellationToken);

        return Ok(result);
    }

    [HttpPost("documentation/propose")]
    public async Task<ActionResult<DocumentationUpdateResponse>> GenerateDocumentationProposal(
        DocumentationUpdateRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Topic))
        {
            return BadRequest("Documentation topic is required.");
        }

        var result = await _documentationProposalService.GenerateDocumentationProposalAsync(request, cancellationToken);

        return Ok(result);
    }
}
'@ | Set-Content -Path "FinSight.Api\Controllers\MlAiController.cs" -Encoding UTF8

# ------------------------------------------------------------
# Patch Program.cs
# ------------------------------------------------------------

$programPath = "FinSight.Api\Program.cs"

if (!(Test-Path $programPath)) {
    throw "Could not find Program.cs at $programPath"
}

$program = Get-Content $programPath -Raw

$usingLines = @(
    "using FinSight.Api.Services.AI;",
    "using FinSight.Core.Interfaces;"
)

foreach ($line in $usingLines) {
    if ($program -notmatch [regex]::Escape($line)) {
        $program = $line + [Environment]::NewLine + $program
    }
}

$diLines = @(
    "builder.Services.AddScoped<IAiGuardrailService, AiGuardrailService>();",
    "builder.Services.AddScoped<ICodebaseContextService, CodebaseContextService>();",
    "builder.Services.AddScoped<IAgenticFeaturePlanningService, AgenticFeaturePlanningService>();",
    "builder.Services.AddScoped<IDocumentationProposalService, DocumentationProposalService>();"
)

foreach ($diLine in $diLines) {
    if ($program -notmatch [regex]::Escape($diLine)) {
        $program = $program -replace "var app = builder\.Build\(\);", ($diLine + [Environment]::NewLine + "var app = builder.Build();")
    }
}

Set-Content -Path $programPath -Value $program -Encoding UTF8

# ------------------------------------------------------------
# Frontend expanded types
# ------------------------------------------------------------

@'
export interface TransactionRiskPredictionRequest {
    accountId?: number;
    accountNumber?: string;
    amount: number;
    transactionType?: string;
    description?: string;
    transactionDate?: string;
    customerRiskRating?: string;
}

export interface TransactionRiskPredictionResponse {
    riskScore: number;
    riskLevel: string;
    requiresReview: boolean;
    reasons: string[];
    modelVersion: string;
    scoredAtUtc: string;
}

export interface EnterpriseAiInsightRequest {
    businessArea: string;
    scenario: string;
    userQuestion: string;
    dataSignals: string[];
}

export interface EnterpriseAiInsightResponse {
    summary: string;
    recommendedActions: string[];
    guardrailsApplied: string[];
    confidenceLevel: string;
    generatedAtUtc: string;
}

export interface AiGuardrailConfigResponse {
    humanReviewRequired: boolean;
    allowCodeGeneration: boolean;
    allowFileWriteBack: boolean;
    allowDocumentationProposals: boolean;
    maxFilesToScan: number;
    protectedPaths: string[];
    blockedTerms: string[];
    approvedUseCases: string[];
    guardrailsApplied: string[];
    loadedAtUtc: string;
}

export interface CodebaseAnalysisRequest {
    repoRoot?: string;
    maxFiles?: number;
    includeExtensions: string[];
}

export interface CodebaseAnalysisResponse {
    rootPath: string;
    filesScanned: number;
    projectPatterns: string[];
    existingMethodsToReuse: string[];
    namingConventions: string[];
    candidateFiles: string[];
    warnings: string[];
    analyzedAtUtc: string;
}

export interface FeatureGenerationRequest {
    featureName: string;
    businessGoal: string;
    targetArea: string;
    requirements: string[];
    reuseExistingMethodsFirst: boolean;
}

export interface FeatureGenerationResponse {
    summary: string;
    existingMethodsToReuse: string[];
    proposedServiceBoundaries: string[];
    proposedFiles: string[];
    implementationSteps: string[];
    testPlan: string[];
    guardrailsApplied: string[];
    generatedAtUtc: string;
}

export interface DocumentationUpdateRequest {
    topic: string;
    changeSummary: string;
    targetDocumentName: string;
    matchExistingDocumentationStyle: boolean;
}

export interface DocumentationUpdateResponse {
    targetDocumentName: string;
    proposedMarkdown: string;
    existingDocumentationSignals: string[];
    namingConventionNotes: string[];
    guardrailsApplied: string[];
    generatedAtUtc: string;
}
'@ | Set-Content -Path "FinSight.Web\src\features\mlai\types\mlAiTypes.ts" -Encoding UTF8

# ------------------------------------------------------------
# Frontend expanded API
# ------------------------------------------------------------

@'
import type {
    AiGuardrailConfigResponse,
    CodebaseAnalysisRequest,
    CodebaseAnalysisResponse,
    DocumentationUpdateRequest,
    DocumentationUpdateResponse,
    EnterpriseAiInsightRequest,
    EnterpriseAiInsightResponse,
    FeatureGenerationRequest,
    FeatureGenerationResponse,
    TransactionRiskPredictionRequest,
    TransactionRiskPredictionResponse
} from "../types/mlAiTypes";

const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7029";

function getToken() {
    return localStorage.getItem("authToken") ?? localStorage.getItem("token");
}

async function getJson<TResponse>(url: string): Promise<TResponse> {
    const token = getToken();

    const response = await fetch(`${apiBaseUrl}${url}`, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json() as Promise<TResponse>;
}

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
    const token = getToken();

    const response = await fetch(`${apiBaseUrl}${url}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json() as Promise<TResponse>;
}

export async function getAiGuardrails(): Promise<AiGuardrailConfigResponse> {
    return getJson<AiGuardrailConfigResponse>("/api/MlAi/guardrails");
}

export async function scoreTransactionRisk(
    request: TransactionRiskPredictionRequest
): Promise<TransactionRiskPredictionResponse> {
    return postJson<TransactionRiskPredictionResponse>(
        "/api/MlAi/transaction-risk",
        request
    );
}

export async function generateEnterpriseInsight(
    request: EnterpriseAiInsightRequest
): Promise<EnterpriseAiInsightResponse> {
    return postJson<EnterpriseAiInsightResponse>(
        "/api/MlAi/enterprise-insight",
        request
    );
}

export async function analyzeCodebase(
    request: CodebaseAnalysisRequest
): Promise<CodebaseAnalysisResponse> {
    return postJson<CodebaseAnalysisResponse>(
        "/api/MlAi/codebase/analyze",
        request
    );
}

export async function generateFeaturePlan(
    request: FeatureGenerationRequest
): Promise<FeatureGenerationResponse> {
    return postJson<FeatureGenerationResponse>(
        "/api/MlAi/feature-plan",
        request
    );
}

export async function proposeDocumentationUpdate(
    request: DocumentationUpdateRequest
): Promise<DocumentationUpdateResponse> {
    return postJson<DocumentationUpdateResponse>(
        "/api/MlAi/documentation/propose",
        request
    );
}
'@ | Set-Content -Path "FinSight.Web\src\features\mlai\api\mlAiApi.ts" -Encoding UTF8

# ------------------------------------------------------------
# Documentation
# ------------------------------------------------------------

@'
# AI Guardrail Configuration

This document explains the configurable AI guardrail model used by the FinSight ML / AI platform foundation.

## Enterprise Rule

The system generates reviewable proposals only. Engineers must review generated code, documentation, and architecture plans before they are committed.

## Supported Capabilities

- Configurable guardrails
- Codebase-aware analysis
- Reuse-first feature planning
- Documentation proposal generation
- Human-in-the-loop review

## Safety Defaults

- Human review required
- File write-back disabled
- Protected paths excluded
- Secrets and credentials blocked from generated prompts and documentation
- Existing project conventions reused before introducing new patterns
'@ | Set-Content -Path "docs\ai-guardrail-configuration.md" -Encoding UTF8

# ------------------------------------------------------------
# Build
# ------------------------------------------------------------

Write-Host "Building API project..." -ForegroundColor Cyan
dotnet build .\FinSight.Api\FinSight.Api.csproj

Write-Host "Building React frontend..." -ForegroundColor Cyan
Set-Location .\FinSight.Web
npm run build
Set-Location $repoRoot

Write-Host "Enterprise AI feature expansion complete." -ForegroundColor Green