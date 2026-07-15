using FinSight.Core.Enums.Uploads;

namespace FinSight.Core.Entities.Uploads;

public class DocumentProcessingJob
{
    public Guid Id { get; set; }
    public Guid UploadedFileId { get; set; }

    public string CurrentStage { get; set; } = string.Empty;
    public ProcessingJobStatus Status { get; set; }

    public string CorrelationId { get; set; } = string.Empty;

    public int RetryCount { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }

    public string? FailureReason { get; set; }

    public UploadedFile UploadedFile { get; set; } = null!;
}
