using FinSight.Core.Enums.Uploads;

namespace FinSight.Core.Entities.Uploads;

public class UploadedFile
{
    public Guid Id { get; set; }

    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;

    public string Extension { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }

    public string Sha256Hash { get; set; } = string.Empty;

    public UploadSecurityStatus SecurityStatus { get; set; }

    public string UploadedByUserId { get; set; } = string.Empty;

    public DateTimeOffset UploadedAt { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public DateTimeOffset? RejectedAt { get; set; }

    public string? RejectionReason { get; set; }

    public ICollection<FileSecurityScan> SecurityScans { get; set; } =
        new List<FileSecurityScan>();

    public ICollection<FileSecurityFinding> SecurityFindings { get; set; } =
        new List<FileSecurityFinding>();

    public ICollection<DocumentProcessingJob> ProcessingJobs { get; set; } =
        new List<DocumentProcessingJob>();
}
