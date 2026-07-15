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
