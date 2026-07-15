using FinSight.Core.Enums.Uploads;

namespace FinSight.Core.DTOs.Uploads;

public sealed record UploadedFileDto(
    Guid Id,
    string OriginalFileName,
    string MimeType,
    long SizeBytes,
    UploadSecurityStatus SecurityStatus,
    DateTimeOffset UploadedAt,
    string? RejectionReason);
