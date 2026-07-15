namespace FinSight.Core.DTOs.AI;

public class AgentChatRequest
{
    public string Message { get; set; } = string.Empty;
    public List<string> UploadedFileIds { get; set; } = new();
    public bool IncludeCodebaseContext { get; set; } = true;
    public bool GenerateDocumentationProposal { get; set; } = true;
    public bool GenerateFeaturePlan { get; set; } = true;
}
