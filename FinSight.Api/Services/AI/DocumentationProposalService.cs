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
