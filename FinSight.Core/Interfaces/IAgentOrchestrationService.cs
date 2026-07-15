using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface IAgentOrchestrationService
{
    Task<AgentChatResponse> ChatAsync(
        AgentChatRequest request,
        CancellationToken cancellationToken = default);
}
