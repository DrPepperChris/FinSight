namespace FinSight.Core.DTOs.AI;

public class AgentChatResponse
{
    public string ResponseType { get; set; } = "General";
    public string Answer { get; set; } = string.Empty;
    public List<string> RecommendedActions { get; set; } = new();
    public List<string> FilesConsidered { get; set; } = new();
    public List<string> PipelineStages { get; set; } = new();
    public List<string> GuardrailsApplied { get; set; } = new();
    public List<string> ProposedFiles { get; set; } = new();
    public List<string> ImplementationSteps { get; set; } = new();
    public string? ProposedMarkdown { get; set; }
    public DateTime GeneratedAtUtc { get; set; } = DateTime.UtcNow;
}
