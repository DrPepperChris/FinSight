using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface IMlRiskScoringService
{
    Task<TransactionRiskPredictionResponse> ScoreTransactionRiskAsync(
        TransactionRiskPredictionRequest request,
        CancellationToken cancellationToken = default);
}
