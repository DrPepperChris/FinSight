using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface IAiGuardrailService
{
    AiGuardrailConfigResponse GetCurrentGuardrails();
    bool IsPathProtected(string path);
}
