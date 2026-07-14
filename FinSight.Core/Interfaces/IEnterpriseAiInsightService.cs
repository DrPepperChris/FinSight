using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface IEnterpriseAiInsightService
{
    Task<EnterpriseAiInsightResponse> GenerateInsightAsync(
        EnterpriseAiInsightRequest request,
        CancellationToken cancellationToken = default);
}
