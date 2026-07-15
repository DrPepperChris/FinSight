namespace FinSight.Core.DTOs.AI;

public class DocumentationUpdateRequest
{
    public string Topic { get; set; } = string.Empty;
    public string ChangeSummary { get; set; } = string.Empty;
    public string TargetDocumentName { get; set; } = "docs/generated-ai-proposal.md";
    public bool MatchExistingDocumentationStyle { get; set; } = true;
}
