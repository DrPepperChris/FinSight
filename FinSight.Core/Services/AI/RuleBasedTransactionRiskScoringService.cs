using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;

namespace FinSight.Core.Services.AI;

public class RuleBasedTransactionRiskScoringService : IMlRiskScoringService
{
    public Task<TransactionRiskPredictionResponse> ScoreTransactionRiskAsync(
        TransactionRiskPredictionRequest request,
        CancellationToken cancellationToken = default)
    {
        var reasons = new List<string>();
        decimal score = 0.05m;

        if (request.Amount >= 10000)
        {
            score += 0.35m;
            reasons.Add("High-value transaction amount.");
        }
        else if (request.Amount >= 5000)
        {
            score += 0.20m;
            reasons.Add("Moderate-value transaction amount.");
        }

        if (string.Equals(request.TransactionType, "Withdrawal", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(request.TransactionType, "TransferOut", StringComparison.OrdinalIgnoreCase))
        {
            score += 0.20m;
            reasons.Add("Outbound movement of funds.");
        }

        if (!string.IsNullOrWhiteSpace(request.CustomerRiskRating) &&
            request.CustomerRiskRating.Contains("High", StringComparison.OrdinalIgnoreCase))
        {
            score += 0.25m;
            reasons.Add("Customer has elevated risk rating.");
        }

        if (!string.IsNullOrWhiteSpace(request.Description) &&
            (
                request.Description.Contains("wire", StringComparison.OrdinalIgnoreCase) ||
                request.Description.Contains("urgent", StringComparison.OrdinalIgnoreCase) ||
                request.Description.Contains("offshore", StringComparison.OrdinalIgnoreCase)
            ))
        {
            score += 0.15m;
            reasons.Add("Description contains risk-sensitive language.");
        }

        if (request.TransactionDate.HasValue &&
            request.TransactionDate.Value.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
        {
            score += 0.05m;
            reasons.Add("Transaction occurred on a weekend.");
        }

        score = Math.Min(score, 0.99m);

        var riskLevel = score switch
        {
            >= 0.75m => "High",
            >= 0.45m => "Medium",
            _ => "Low"
        };

        if (reasons.Count == 0)
        {
            reasons.Add("No elevated risk signals detected.");
        }

        var response = new TransactionRiskPredictionResponse
        {
            RiskScore = decimal.Round(score, 2),
            RiskLevel = riskLevel,
            RequiresReview = score >= 0.45m,
            Reasons = reasons,
            ModelVersion = "rule-based-v1",
            ScoredAtUtc = DateTime.UtcNow
        };

        return Task.FromResult(response);
    }
}
