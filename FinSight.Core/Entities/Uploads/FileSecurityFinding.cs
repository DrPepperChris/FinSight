namespace FinSight.Core.Entities.Uploads;

public class FileSecurityFinding
{
    public Guid Id { get; set; }
    public Guid UploadedFileId { get; set; }

    public string FindingCode { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RecommendedAction { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public UploadedFile UploadedFile { get; set; } = null!;
}
