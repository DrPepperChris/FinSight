namespace FinSight.Core.DTOs.AI;

public class KnowledgePipelineStatusResponse
{
    public string FileId { get; set; } = string.Empty;
    public string CurrentLayer { get; set; } = "Bronze";
    public List<string> BronzeStage { get; set; } = new();
    public List<string> SilverStage { get; set; } = new();
    public List<string> GoldStage { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
