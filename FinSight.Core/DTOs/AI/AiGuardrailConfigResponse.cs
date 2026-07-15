namespace FinSight.Core.DTOs.AI;

public class AiGuardrailConfigResponse
{
    public bool HumanReviewRequired { get; set; }
    public bool AllowCodeGeneration { get; set; }
    public bool AllowFileWriteBack { get; set; }
    public bool AllowDocumentationProposals { get; set; }
    public int MaxFilesToScan { get; set; }
    public List<string> ProtectedPaths { get; set; } = new();
    public List<string> BlockedTerms { get; set; } = new();
    public List<string> ApprovedUseCases { get; set; } = new();
    public List<string> GuardrailsApplied { get; set; } = new();
    public DateTime LoadedAtUtc { get; set; } = DateTime.UtcNow;
}
