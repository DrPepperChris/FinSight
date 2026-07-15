using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface IAgenticFeaturePlanningService
{
    Task<FeatureGenerationResponse> GenerateFeaturePlanAsync(
        FeatureGenerationRequest request,
        CancellationToken cancellationToken = default);
}
