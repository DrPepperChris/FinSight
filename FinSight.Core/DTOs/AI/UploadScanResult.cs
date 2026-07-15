namespace FinSight.Core.DTOs.AI;

public class UploadScanResult
{
    public string ScanStatus { get; set; } = "Pending";
    public bool IsAllowed { get; set; }
    public bool RequiresReview { get; set; }
    public List<string> Findings { get; set; } = new();
    public List<string> GuardrailsApplied { get; set; } = new();
    public DateTime ScannedAtUtc { get; set; } = DateTime.UtcNow;
}
