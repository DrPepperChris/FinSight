$ErrorActionPreference = "Stop"

$repoRoot = "C:\work\source\repos\FinSight"
Set-Location $repoRoot

Write-Host "Adding FinSight AI Agent pipeline, upload scanning, and ETL foundation..." -ForegroundColor Cyan

$folders = @(
    "FinSight.Core\DTOs\AI",
    "FinSight.Core\Interfaces",
    "FinSight.Api\Services\AI",
    "FinSight.Api\App_Data\ai-uploads\bronze",
    "FinSight.Api\App_Data\ai-uploads\silver",
    "FinSight.Api\App_Data\ai-uploads\gold",
    "docs"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# ------------------------------------------------------------
# DTOs
# ------------------------------------------------------------

@'
namespace FinSight.Core.DTOs.AI;

public class AgentChatRequest
{
    public string Message { get; set; } = string.Empty;
    public List<string> UploadedFileIds { get; set; } = new();
    public bool IncludeCodebaseContext { get; set; } = true;
    public bool GenerateDocumentationProposal { get; set; } = true;
    public bool GenerateFeaturePlan { get; set; } = true;
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\AgentChatRequest.cs" -Encoding UTF8

@'
namespace FinSight.Core.DTOs.AI;

public class AgentChatResponse
{
    public string ResponseType { get; set; } = "General";
    public string Answer { get; set; } = string.Empty;
    public List<string> RecommendedActions { get; set; } = new();
    public List<string> FilesConsidered { get; set; } = new();
    public List<string> PipelineStages { get; set; } = new();
    public List<string> GuardrailsApplied { get; set; } = new();
    public List<string> ProposedFiles { get; set; } = new();
    public List<string> ImplementationSteps { get; set; } = new();
    public string? ProposedMarkdown { get; set; }
    public DateTime GeneratedAtUtc { get; set; } = DateTime.UtcNow;
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\AgentChatResponse.cs" -Encoding UTF8

@'
namespace FinSight.Core.DTOs.AI;

public class AgentUploadedFileResponse
{
    public string FileId { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string UploadStatus { get; set; } = "Pending";
    public string PipelineLayer { get; set; } = "Bronze";
    public UploadScanResult ScanResult { get; set; } = new();
    public List<string> PipelineStages { get; set; } = new();
    public DateTime UploadedAtUtc { get; set; } = DateTime.UtcNow;
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\AgentUploadedFileResponse.cs" -Encoding UTF8

@'
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
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\UploadScanResult.cs" -Encoding UTF8

@'
namespace FinSight.Core.DTOs.AI;

public class KnowledgePipelineStatusResponse
{
    public string FileId { get; set; } = string.Empty;
    public string CurrentLayer { get; set; } = "Bronze";
    public List<string> BronzeStage { get; set; } = new();
    public List<string> SilverStage { get; set; } = new();
    public List<string> GoldStage { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\KnowledgePipelineStatusResponse.cs" -Encoding UTF8

# ------------------------------------------------------------
# Interfaces
# ------------------------------------------------------------

@'
using FinSight.Core.DTOs.AI;
using Microsoft.AspNetCore.Http;

namespace FinSight.Core.Interfaces;

public interface IKnowledgeIngestionPipelineService
{
    Task<AgentUploadedFileResponse> UploadAndScanAsync(
        IFormFile file,
        CancellationToken cancellationToken = default);
}
'@ | Set-Content -Path "FinSight.Core\Interfaces\IKnowledgeIngestionPipelineService.cs" -Encoding UTF8

@'
using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface IAgentOrchestrationService
{
    Task<AgentChatResponse> ChatAsync(
        AgentChatRequest request,
        CancellationToken cancellationToken = default);
}
'@ | Set-Content -Path "FinSight.Core\Interfaces\IAgentOrchestrationService.cs" -Encoding UTF8

# ------------------------------------------------------------
# Upload scanner / ETL service
# ------------------------------------------------------------

@'
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
'@ | Set-Content -Path "FinSight.Api\Services\AI\KnowledgeIngestionPipelineService.cs" -Encoding UTF8

# ------------------------------------------------------------
# Agent orchestration service
# ------------------------------------------------------------

@'
using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;

namespace FinSight.Api.Services.AI;

public class AgentOrchestrationService : IAgentOrchestrationService
{
    private readonly IAiGuardrailService _guardrailService;
    private readonly ICodebaseContextService _codebaseContextService;
    private readonly IAgenticFeaturePlanningService _featurePlanningService;
    private readonly IDocumentationProposalService _documentationProposalService;
    private readonly IEnterpriseAiInsightService _enterpriseAiInsightService;

    public AgentOrchestrationService(
        IAiGuardrailService guardrailService,
        ICodebaseContextService codebaseContextService,
        IAgenticFeaturePlanningService featurePlanningService,
        IDocumentationProposalService documentationProposalService,
        IEnterpriseAiInsightService enterpriseAiInsightService)
    {
        _guardrailService = guardrailService;
        _codebaseContextService = codebaseContextService;
        _featurePlanningService = featurePlanningService;
        _documentationProposalService = documentationProposalService;
        _enterpriseAiInsightService = enterpriseAiInsightService;
    }

    public async Task<AgentChatResponse> ChatAsync(
        AgentChatRequest request,
        CancellationToken cancellationToken = default)
    {
        var guardrails = _guardrailService.GetCurrentGuardrails();
        var intent = DetectIntent(request.Message);

        var response = new AgentChatResponse
        {
            ResponseType = intent,
            GuardrailsApplied = guardrails.GuardrailsApplied,
            FilesConsidered = request.UploadedFileIds,
            PipelineStages = new()
            {
                "Agent request received.",
                "Guardrails loaded.",
                $"Detected intent: {intent}.",
                "Human review required before production-impacting changes."
            }
        };

        if (request.UploadedFileIds.Count > 0)
        {
            response.PipelineStages.Add("Uploaded file references attached to the agent request.");
            response.PipelineStages.Add("Bronze knowledge can be used only as unapproved context until promoted.");
        }

        if (intent is "FeaturePlan" or "CompanyKnowledge")
        {
            var featurePlan = await _featurePlanningService.GenerateFeaturePlanAsync(
                new FeatureGenerationRequest
                {
                    FeatureName = ExtractFeatureName(request.Message),
                    BusinessGoal = request.Message,
                    TargetArea = "AI Agent, Data Pipeline, Documentation, Code Standards",
                    Requirements = new()
                    {
                        "Use chat-style text input",
                        "Support file uploads",
                        "Scan uploads before processing",
                        "Use Bronze Silver Gold ETL layers",
                        "Prefer existing code patterns",
                        "Generate reviewable proposals only",
                        "Prepare for Azure-hosted LLM integration"
                    },
                    ReuseExistingMethodsFirst = true
                },
                cancellationToken);

            response.Answer =
                "I created a reuse-first implementation plan for a FinSight AI Agent backed by a governed upload and ETL pipeline. " +
                "The design keeps uploaded files in Bronze until scanned, normalizes approved content into Silver, and promotes reviewed company standards into Gold.";

            response.ProposedFiles = featurePlan.ProposedFiles;
            response.ImplementationSteps = featurePlan.ImplementationSteps;
            response.RecommendedActions = new()
            {
                "Create the chat-style agent endpoint and UI.",
                "Store uploads in the Bronze layer after scan checks pass.",
                "Add Silver extraction for text, code, markdown, screenshots, PDFs, and Word documents.",
                "Require approval before promoting generated standards to Gold.",
                "Use Azure Blob Storage, Azure AI Search, and Azure OpenAI when deployed."
            };

            return response;
        }

        if (intent is "Documentation")
        {
            var documentation = await _documentationProposalService.GenerateDocumentationProposalAsync(
                new DocumentationUpdateRequest
                {
                    Topic = "FinSight AI Agent Pipeline",
                    ChangeSummary = request.Message,
                    TargetDocumentName = "docs/finsight-ai-agent-pipeline.md",
                    MatchExistingDocumentationStyle = true
                },
                cancellationToken);

            response.Answer =
                "I generated a documentation proposal for the FinSight AI Agent pipeline using the existing documentation style and guardrails.";

            response.ProposedMarkdown = documentation.ProposedMarkdown;
            response.RecommendedActions = new()
            {
                "Review the proposed markdown.",
                "Confirm pipeline naming matches the project conventions.",
                "Approve documentation before treating it as a company standard."
            };

            return response;
        }

        if (intent is "CodebaseAnalysis")
        {
            var analysis = await _codebaseContextService.AnalyzeCodebaseAsync(
                new CodebaseAnalysisRequest
                {
                    MaxFiles = guardrails.MaxFilesToScan
                },
                cancellationToken);

            response.Answer =
                $"I scanned {analysis.FilesScanned} files and identified reusable project patterns, naming conventions, and candidate methods.";

            response.RecommendedActions = analysis.ProjectPatterns
                .Concat(analysis.NamingConventions)
                .Concat(analysis.Warnings)
                .Distinct()
                .ToList();

            return response;
        }

        var insight = await _enterpriseAiInsightService.GenerateInsightAsync(
            new EnterpriseAiInsightRequest
            {
                BusinessArea = "AI Agent",
                Scenario = "User asked the FinSight AI Agent for assistance.",
                UserQuestion = request.Message,
                DataSignals = request.UploadedFileIds.Count > 0
                    ? new() { "Uploaded files attached", "Guardrails required", "Human review required" }
                    : new() { "No uploaded files attached", "Guardrails required", "Human review required" }
            },
            cancellationToken);

        response.Answer = insight.Summary;
        response.RecommendedActions = insight.RecommendedActions;
        response.GuardrailsApplied = insight.GuardrailsApplied;

        return response;
    }

    private static string DetectIntent(string message)
    {
        if (ContainsAny(message, "llm", "agent", "upload", "documents", "standards", "knowledge", "etl", "pipeline"))
        {
            return "CompanyKnowledge";
        }

        if (ContainsAny(message, "feature", "implement", "build", "add"))
        {
            return "FeaturePlan";
        }

        if (ContainsAny(message, "documentation", "readme", "docs", "markdown"))
        {
            return "Documentation";
        }

        if (ContainsAny(message, "codebase", "reuse", "existing methods", "scan repo"))
        {
            return "CodebaseAnalysis";
        }

        return "GeneralInsight";
    }

    private static string ExtractFeatureName(string message)
    {
        if (ContainsAny(message, "llm", "agent", "knowledge", "upload", "standards"))
        {
            return "Company Knowledge Intelligence";
        }

        return "Agent Generated Feature";
    }

    private static bool ContainsAny(string value, params string[] terms)
    {
        return terms.Any(term => value.Contains(term, StringComparison.OrdinalIgnoreCase));
    }
}
'@ | Set-Content -Path "FinSight.Api\Services\AI\AgentOrchestrationService.cs" -Encoding UTF8

# ------------------------------------------------------------
# Replace ML/AI controller with existing endpoints + agent endpoints
# ------------------------------------------------------------

@'
using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSight.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Analyst,Auditor")]
[Route("api/[controller]")]
public class MlAiController : ControllerBase
{
    private readonly IMlRiskScoringService _riskScoringService;
    private readonly IEnterpriseAiInsightService _aiInsightService;
    private readonly IAiGuardrailService _guardrailService;
    private readonly ICodebaseContextService _codebaseContextService;
    private readonly IAgenticFeaturePlanningService _featurePlanningService;
    private readonly IDocumentationProposalService _documentationProposalService;
    private readonly IKnowledgeIngestionPipelineService _knowledgeIngestionPipelineService;
    private readonly IAgentOrchestrationService _agentOrchestrationService;

    public MlAiController(
        IMlRiskScoringService riskScoringService,
        IEnterpriseAiInsightService aiInsightService,
        IAiGuardrailService guardrailService,
        ICodebaseContextService codebaseContextService,
        IAgenticFeaturePlanningService featurePlanningService,
        IDocumentationProposalService documentationProposalService,
        IKnowledgeIngestionPipelineService knowledgeIngestionPipelineService,
        IAgentOrchestrationService agentOrchestrationService)
    {
        _riskScoringService = riskScoringService;
        _aiInsightService = aiInsightService;
        _guardrailService = guardrailService;
        _codebaseContextService = codebaseContextService;
        _featurePlanningService = featurePlanningService;
        _documentationProposalService = documentationProposalService;
        _knowledgeIngestionPipelineService = knowledgeIngestionPipelineService;
        _agentOrchestrationService = agentOrchestrationService;
    }

    [HttpGet("guardrails")]
    public ActionResult<AiGuardrailConfigResponse> GetGuardrails()
    {
        return Ok(_guardrailService.GetCurrentGuardrails());
    }

    [HttpPost("agent/upload")]
    [RequestSizeLimit(10_485_760)]
    public async Task<ActionResult<AgentUploadedFileResponse>> UploadAgentFile(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file is null)
        {
            return BadRequest("File is required.");
        }

        var result = await _knowledgeIngestionPipelineService.UploadAndScanAsync(
            file,
            cancellationToken);

        if (!result.ScanResult.IsAllowed)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("agent/chat")]
    public async Task<ActionResult<AgentChatResponse>> ChatWithAgent(
        AgentChatRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest("Message is required.");
        }

        var result = await _agentOrchestrationService.ChatAsync(
            request,
            cancellationToken);

        return Ok(result);
    }

    [HttpPost("transaction-risk")]
    public async Task<ActionResult<TransactionRiskPredictionResponse>> ScoreTransactionRisk(
        TransactionRiskPredictionRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Amount <= 0)
        {
            return BadRequest("Amount must be greater than zero.");
        }

        var result = await _riskScoringService.ScoreTransactionRiskAsync(
            request,
            cancellationToken);

        return Ok(result);
    }

    [HttpPost("enterprise-insight")]
    public async Task<ActionResult<EnterpriseAiInsightResponse>> GenerateEnterpriseInsight(
        EnterpriseAiInsightRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UserQuestion) &&
            string.IsNullOrWhiteSpace(request.Scenario))
        {
            return BadRequest("Scenario or user question is required.");
        }

        var result = await _aiInsightService.GenerateInsightAsync(
            request,
            cancellationToken);

        return Ok(result);
    }

    [HttpPost("codebase/analyze")]
    public async Task<ActionResult<CodebaseAnalysisResponse>> AnalyzeCodebase(
        CodebaseAnalysisRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _codebaseContextService.AnalyzeCodebaseAsync(
            request,
            cancellationToken);

        return Ok(result);
    }

    [HttpPost("feature-plan")]
    public async Task<ActionResult<FeatureGenerationResponse>> GenerateFeaturePlan(
        FeatureGenerationRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.FeatureName))
        {
            return BadRequest("Feature name is required.");
        }

        var result = await _featurePlanningService.GenerateFeaturePlanAsync(
            request,
            cancellationToken);

        return Ok(result);
    }

    [HttpPost("documentation/propose")]
    public async Task<ActionResult<DocumentationUpdateResponse>> GenerateDocumentationProposal(
        DocumentationUpdateRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Topic))
        {
            return BadRequest("Documentation topic is required.");
        }

        var result = await _documentationProposalService.GenerateDocumentationProposalAsync(
            request,
            cancellationToken);

        return Ok(result);
    }
}
'@ | Set-Content -Path "FinSight.Api\Controllers\MlAiController.cs" -Encoding UTF8

# ------------------------------------------------------------
# Patch Program.cs DI
# ------------------------------------------------------------

$programPath = "FinSight.Api\Program.cs"
$program = Get-Content $programPath -Raw

$usingLines = @(
    "using FinSight.Api.Services.AI;",
    "using FinSight.Core.Interfaces;"
)

foreach ($line in $usingLines) {
    if ($program -notmatch [regex]::Escape($line)) {
        $program = $line + [Environment]::NewLine + $program
    }
}

$diLines = @(
    "builder.Services.AddScoped<IKnowledgeIngestionPipelineService, KnowledgeIngestionPipelineService>();",
    "builder.Services.AddScoped<IAgentOrchestrationService, AgentOrchestrationService>();"
)

foreach ($diLine in $diLines) {
    if ($program -notmatch [regex]::Escape($diLine)) {
        $program = $program -replace "var app = builder\.Build\(\);", ($diLine + [Environment]::NewLine + "var app = builder.Build();")
    }
}

Set-Content -Path $programPath -Value $program -Encoding UTF8

# ------------------------------------------------------------
# Documentation
# ------------------------------------------------------------

@'
# FinSight AI Agent Pipeline

## Purpose

The FinSight AI Agent pipeline demonstrates how an enterprise AI assistant can safely accept employee uploads, scan them, process them through ETL layers, and generate reviewable recommendations.

## Pipeline Layers

### Bronze

Raw upload intake. Files are stored only after demo scan checks pass.

### Silver

Cleaned and normalized knowledge. Text extraction, classification, chunking, and metadata generation belong here.

### Gold

Approved company knowledge. Coding standards, documentation formats, architecture decisions, and reusable patterns must be reviewed before promotion to Gold.

## Demo Scan Controls

The demo scanner currently checks:

- Allowed file extensions
- File size limit
- Empty files
- Secret-like text patterns
- Protected upload handling

## Azure Production Direction

Future Azure deployment should use:

- Azure Blob Storage for uploaded files
- Azure SQL for upload metadata and audit records
- Azure AI Search for searchable company knowledge
- Azure OpenAI or Azure AI Foundry for agent responses
- Microsoft Defender for Storage or equivalent malware scanning
- Application Insights for monitoring
'@ | Set-Content -Path "docs\finsight-ai-agent-pipeline.md" -Encoding UTF8

Write-Host "Building API project..." -ForegroundColor Cyan
dotnet build .\FinSight.Api\FinSight.Api.csproj

Write-Host "FinSight AI Agent pipeline foundation complete." -ForegroundColor Green