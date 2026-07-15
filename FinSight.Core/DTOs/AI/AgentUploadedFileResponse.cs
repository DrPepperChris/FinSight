namespace FinSight.Core.DTOs.AI;

public class AgentUploadedFileResponse
{
    public string FileId { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string UploadStatus { get; set; } = "Pending";
    public string PipelineLayer { get; set; } = "Bronze";
    public UploadScanResult ScanResult { get; set; } = new();
    public List<string> PipelineStages { get; set; } = new();
    public DateTime UploadedAtUtc { get; set; } = DateTime.UtcNow;
}
