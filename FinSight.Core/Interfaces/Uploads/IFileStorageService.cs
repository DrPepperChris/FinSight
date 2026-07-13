namespace FinSight.Core.Interfaces.Uploads;

public interface IFileStorageService
{
    Task<string> SaveToQuarantineAsync(
        Stream content,
        string storedFileName,
        CancellationToken cancellationToken);

    Task MoveToApprovedAsync(
        string quarantinePath,
        string approvedPath,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        string storagePath,
        CancellationToken cancellationToken);
}
