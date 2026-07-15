namespace FinSight.Core.DTOs.AI;

public class EnterpriseAiInsightResponse
{
    public string Summary { get; set; } = string.Empty;
    public List<string> RecommendedActions { get; set; } = new();
    public List<string> GuardrailsApplied { get; set; } = new();
    public string ConfidenceLevel { get; set; } = "Medium";
    public DateTime GeneratedAtUtc { get; set; } = DateTime.UtcNow;
}
