namespace FinSight.Core.DTOs.AI;

public class FeatureGenerationRequest
{
    public string FeatureName { get; set; } = string.Empty;
    public string BusinessGoal { get; set; } = string.Empty;
    public string TargetArea { get; set; } = string.Empty;
    public List<string> Requirements { get; set; } = new();
    public bool ReuseExistingMethodsFirst { get; set; } = true;
}
