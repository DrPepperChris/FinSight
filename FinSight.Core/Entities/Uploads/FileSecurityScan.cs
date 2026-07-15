using FinSight.Core.Enums.Uploads;

namespace FinSight.Core.Entities.Uploads;

public class FileSecurityScan
{
    public Guid Id { get; set; }
    public Guid UploadedFileId { get; set; }

    public string ScannerName { get; set; } = string.Empty;
    public string? ScannerVersion { get; set; }

    public FileScanResult Result { get; set; }

    public string? ThreatName { get; set; }
    public string? ErrorMessage { get; set; }

    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }

    public UploadedFile UploadedFile { get; set; } = null!;
}
