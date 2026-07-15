namespace FinSight.Core.Enums.Uploads;

public enum UploadSecurityStatus
{
    Pending = 1,
    Validating = 2,
    Scanning = 3,
    Quarantined = 4,
    Rejected = 5,
    Approved = 6,
    ScanFailed = 7
}
