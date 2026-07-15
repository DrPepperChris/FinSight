using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface IDocumentationProposalService
{
    Task<DocumentationUpdateResponse> GenerateDocumentationProposalAsync(
        DocumentationUpdateRequest request,
        CancellationToken cancellationToken = default);
}
