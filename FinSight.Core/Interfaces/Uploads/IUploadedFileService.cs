using FinSight.Core.DTOs.Uploads;

namespace FinSight.Core.Interfaces.Uploads;

public interface IUploadedFileService
{
    Task<UploadedFileDto> UploadToQuarantineAsync(
        Stream content,
        string originalFileName,
        string mimeType,
        long sizeBytes,
        string uploadedByUserId,
        CancellationToken cancellationToken);

    Task<UploadedFileDto?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);
}
