using System.Text.RegularExpressions;
using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;

namespace FinSight.Api.Services.AI;

public class KnowledgeIngestionPipelineService : IKnowledgeIngestionPipelineService
{
    private readonly IWebHostEnvironment _environment;
    private readonly IAiGuardrailService _guardrailService;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".txt",
        ".md",
        ".json",
        ".csv",
        ".cs",
        ".ts",
        ".tsx",
        ".sql",
        ".png",
        ".jpg",
        ".jpeg",
        ".pdf",
        ".docx"
    };

    private static readonly HashSet<string> TextReadableExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".txt",
        ".md",
        ".json",
        ".csv",
        ".cs",
        ".ts",
        ".tsx",
        ".sql"
    };

    private const long MaxDemoUploadBytes = 10 * 1024 * 1024;

    public KnowledgeIngestionPipelineService(
        IWebHostEnvironment environment,
        IAiGuardrailService guardrailService)
    {
        _environment = environment;
        _guardrailService = guardrailService;
    }

    public async Task<AgentUploadedFileResponse> UploadAndScanAsync(
        IFormFile file,
        CancellationToken cancellationToken = default)
    {
        var fileId = Guid.NewGuid().ToString("N");
        var originalName = Path.GetFileName(file.FileName);
        var extension = Path.GetExtension(originalName);
        var storedName = $"{fileId}{extension}";
        var uploadRoot = Path.Combine(_environment.ContentRootPath, "App_Data", "ai-uploads", "bronze");
        var storedPath = Path.Combine(uploadRoot, storedName);

        Directory.CreateDirectory(uploadRoot);

        var response = new AgentUploadedFileResponse
        {
            FileId = fileId,
            OriginalFileName = originalName,
            StoredFileName = storedName,
            ContentType = file.ContentType ?? "application/octet-stream",
            FileSizeBytes = file.Length,
            PipelineLayer = "Bronze",
            PipelineStages = new()
            {
                "Bronze intake started.",
                "File metadata captured.",
                "Demo upload scan started."
            }
        };

        var scan = response.ScanResult;
        scan.GuardrailsApplied = new()
        {
            "File name normalized before storage.",
            "Protected extensions are blocked.",
            "Maximum demo upload size is enforced.",
            "Text-readable files are scanned for secret-like patterns.",
            "Uploaded content remains in Bronze until reviewed."
        };

        if (file.Length == 0)
        {
            scan.ScanStatus = "Blocked";
            scan.IsAllowed = false;
            scan.RequiresReview = true;
            scan.Findings.Add("File is empty.");
            response.UploadStatus = "Blocked";
            return response;
        }

        if (file.Length > MaxDemoUploadBytes)
        {
            scan.ScanStatus = "Blocked";
            scan.IsAllowed = false;
            scan.RequiresReview = true;
            scan.Findings.Add("File exceeds the 10 MB demo upload limit.");
            response.UploadStatus = "Blocked";
            return response;
        }

        if (!AllowedExtensions.Contains(extension))
        {
            scan.ScanStatus = "Blocked";
            scan.IsAllowed = false;
            scan.RequiresReview = true;
            scan.Findings.Add($"File extension is not allowed for the demo pipeline: {extension}");
            response.UploadStatus = "Blocked";
            return response;
        }

        await using (var stream = File.Create(storedPath))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        response.PipelineStages.Add("File stored in Bronze layer.");

        if (TextReadableExtensions.Contains(extension))
        {
            var text = await File.ReadAllTextAsync(storedPath, cancellationToken);
            var findings = ScanTextForSensitivePatterns(text);

            if (findings.Count > 0)
            {
                scan.Findings.AddRange(findings);
                scan.ScanStatus = "NeedsReview";
                scan.IsAllowed = true;
                scan.RequiresReview = true;
                response.UploadStatus = "NeedsReview";
                response.PipelineStages.Add("Secret-like content detected. Human review required before Silver processing.");
                return response;
            }

            response.PipelineStages.Add("Text-readable content scanned for secret-like patterns.");
            response.PipelineStages.Add("Silver candidate created: extracted text is eligible for normalization.");
        }
        else
        {
            response.PipelineStages.Add("Binary or rich document uploaded. Text extraction is deferred to future Azure document processing.");
            response.PipelineStages.Add("Silver processing requires OCR/document extraction integration.");
        }

        scan.ScanStatus = "Clean";
        scan.IsAllowed = true;
        scan.RequiresReview = false;
        scan.Findings.Add("No demo scanner findings detected.");
        response.UploadStatus = "Accepted";
        response.PipelineStages.Add("Gold promotion requires authorized human approval.");

        return response;
    }

    private static List<string> ScanTextForSensitivePatterns(string text)
    {
        var findings = new List<string>();

        var checks = new Dictionary<string, string>
        {
            ["Possible password assignment"] = @"password\s*[:=]",
            ["Possible secret assignment"] = @"secret\s*[:=]",
            ["Possible API key"] = @"api[_-]?key\s*[:=]",
            ["Possible bearer token"] = @"bearer\s+[a-z0-9\._\-]+",
            ["Possible connection string"] = @"(server|data source)\s*=.*(password|pwd)\s*="
        };

        foreach (var check in checks)
        {
            if (Regex.IsMatch(text, check.Value, RegexOptions.IgnoreCase))
            {
                findings.Add(check.Key);
            }
        }

        return findings;
    }
}
