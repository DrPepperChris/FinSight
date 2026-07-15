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
