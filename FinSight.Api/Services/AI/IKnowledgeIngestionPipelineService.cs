using FinSight.Core.DTOs.AI;
using Microsoft.AspNetCore.Http;

namespace FinSight.Api.Services.AI;

public interface IKnowledgeIngestionPipelineService
{
    Task<AgentUploadedFileResponse> UploadAndScanAsync(
        IFormFile file,
        CancellationToken cancellationToken = default);
}