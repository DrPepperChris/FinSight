using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface ICodebaseContextService
{
    Task<CodebaseAnalysisResponse> AnalyzeCodebaseAsync(
        CodebaseAnalysisRequest request,
        CancellationToken cancellationToken = default);
}
