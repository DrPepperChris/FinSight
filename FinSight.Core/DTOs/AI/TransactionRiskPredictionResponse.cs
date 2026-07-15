namespace FinSight.Core.DTOs.AI;

public class TransactionRiskPredictionResponse
{
    public decimal RiskScore { get; set; }
    public string RiskLevel { get; set; } = "Low";
    public bool RequiresReview { get; set; }
    public List<string> Reasons { get; set; } = new();
    public string ModelVersion { get; set; } = "rule-based-v1";
    public DateTime ScoredAtUtc { get; set; } = DateTime.UtcNow;
}
