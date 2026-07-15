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
