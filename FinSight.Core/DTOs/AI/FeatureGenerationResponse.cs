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
