$ErrorActionPreference = "Stop"

$repoRoot = "C:\work\source\repos\FinSight"

Write-Host "Starting FinSight ML/AI update..." -ForegroundColor Cyan

if (!(Test-Path $repoRoot)) {
    throw "Repo path not found: $repoRoot"
}

Set-Location $repoRoot

$requiredFolders = @(
    "FinSight.Api",
    "FinSight.Core",
    "FinSight.Web"
)

foreach ($folder in $requiredFolders) {
    if (!(Test-Path $folder)) {
        throw "Required folder missing: $folder. Make sure you are in the FinSight repo."
    }
}

# ------------------------------------------------------------
# Create backend folders
# ------------------------------------------------------------

$backendFolders = @(
    "FinSight.Core\DTOs\AI",
    "FinSight.Core\Interfaces",
    "FinSight.Api\Controllers",
    "docs"
)

foreach ($folder in $backendFolders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# Create optional projects/folders if they exist in this branch.
# If they do not exist, we will place services in Core so the build is simpler.

$hasMlProject = Test-Path "FinSight.ML\FinSight.ML.csproj"
$hasInfrastructureProject = Test-Path "FinSight.Infrastructure\FinSight.Infrastructure.csproj"

if ($hasMlProject) {
    New-Item -ItemType Directory -Force -Path "FinSight.ML\Services" | Out-Null
}
else {
    New-Item -ItemType Directory -Force -Path "FinSight.Core\Services\AI" | Out-Null
}

if ($hasInfrastructureProject) {
    New-Item -ItemType Directory -Force -Path "FinSight.Infrastructure\AI" | Out-Null
}
else {
    New-Item -ItemType Directory -Force -Path "FinSight.Core\Services\AI" | Out-Null
}

# ------------------------------------------------------------
# Backend DTOs
# ------------------------------------------------------------

@'
namespace FinSight.Core.DTOs.AI;

public class TransactionRiskPredictionRequest
{
    public int? AccountId { get; set; }
    public string? AccountNumber { get; set; }
    public decimal Amount { get; set; }
    public string? TransactionType { get; set; }
    public string? Description { get; set; }
    public DateTime? TransactionDate { get; set; }
    public string? CustomerRiskRating { get; set; }
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\TransactionRiskPredictionRequest.cs" -Encoding UTF8

@'
namespace FinSight.Core.DTOs.AI;

public class TransactionRiskPredictionResponse
{
    public decimal RiskScore { get; set; }
    public string RiskLevel { get; set; } = "Low";
    public bool RequiresReview { get; set; }
    public List<string> Reasons { get; set; } = new();
    public string ModelVersion { get; set; } = "rule-based-v1";
    public DateTime ScoredAtUtc { get; set; } = DateTime.UtcNow;
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\TransactionRiskPredictionResponse.cs" -Encoding UTF8

@'
namespace FinSight.Core.DTOs.AI;

public class EnterpriseAiInsightRequest
{
    public string BusinessArea { get; set; } = "Transactions";
    public string Scenario { get; set; } = string.Empty;
    public string UserQuestion { get; set; } = string.Empty;
    public List<string> DataSignals { get; set; } = new();
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\EnterpriseAiInsightRequest.cs" -Encoding UTF8

@'
namespace FinSight.Core.DTOs.AI;

public class EnterpriseAiInsightResponse
{
    public string Summary { get; set; } = string.Empty;
    public List<string> RecommendedActions { get; set; } = new();
    public List<string> GuardrailsApplied { get; set; } = new();
    public string ConfidenceLevel { get; set; } = "Medium";
    public DateTime GeneratedAtUtc { get; set; } = DateTime.UtcNow;
}
'@ | Set-Content -Path "FinSight.Core\DTOs\AI\EnterpriseAiInsightResponse.cs" -Encoding UTF8

# ------------------------------------------------------------
# Backend interfaces
# ------------------------------------------------------------

@'
using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface IMlRiskScoringService
{
    Task<TransactionRiskPredictionResponse> ScoreTransactionRiskAsync(
        TransactionRiskPredictionRequest request,
        CancellationToken cancellationToken = default);
}
'@ | Set-Content -Path "FinSight.Core\Interfaces\IMlRiskScoringService.cs" -Encoding UTF8

@'
using FinSight.Core.DTOs.AI;

namespace FinSight.Core.Interfaces;

public interface IEnterpriseAiInsightService
{
    Task<EnterpriseAiInsightResponse> GenerateInsightAsync(
        EnterpriseAiInsightRequest request,
        CancellationToken cancellationToken = default);
}
'@ | Set-Content -Path "FinSight.Core\Interfaces\IEnterpriseAiInsightService.cs" -Encoding UTF8

# ------------------------------------------------------------
# Backend service implementations
# ------------------------------------------------------------

if ($hasMlProject) {
    $riskServicePath = "FinSight.ML\Services\RuleBasedTransactionRiskScoringService.cs"
    $riskServiceNamespace = "FinSight.ML.Services"
}
else {
    $riskServicePath = "FinSight.Core\Services\AI\RuleBasedTransactionRiskScoringService.cs"
    $riskServiceNamespace = "FinSight.Core.Services.AI"
}

$riskServiceContent = @"
using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;

namespace $riskServiceNamespace;

public class RuleBasedTransactionRiskScoringService : IMlRiskScoringService
{
    public Task<TransactionRiskPredictionResponse> ScoreTransactionRiskAsync(
        TransactionRiskPredictionRequest request,
        CancellationToken cancellationToken = default)
    {
        var reasons = new List<string>();
        decimal score = 0.05m;

        if (request.Amount >= 10000)
        {
            score += 0.35m;
            reasons.Add("High-value transaction amount.");
        }
        else if (request.Amount >= 5000)
        {
            score += 0.20m;
            reasons.Add("Moderate-value transaction amount.");
        }

        if (string.Equals(request.TransactionType, "Withdrawal", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(request.TransactionType, "TransferOut", StringComparison.OrdinalIgnoreCase))
        {
            score += 0.20m;
            reasons.Add("Outbound movement of funds.");
        }

        if (!string.IsNullOrWhiteSpace(request.CustomerRiskRating) &&
            request.CustomerRiskRating.Contains("High", StringComparison.OrdinalIgnoreCase))
        {
            score += 0.25m;
            reasons.Add("Customer has elevated risk rating.");
        }

        if (!string.IsNullOrWhiteSpace(request.Description) &&
            (
                request.Description.Contains("wire", StringComparison.OrdinalIgnoreCase) ||
                request.Description.Contains("urgent", StringComparison.OrdinalIgnoreCase) ||
                request.Description.Contains("offshore", StringComparison.OrdinalIgnoreCase)
            ))
        {
            score += 0.15m;
            reasons.Add("Description contains risk-sensitive language.");
        }

        if (request.TransactionDate.HasValue &&
            request.TransactionDate.Value.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
        {
            score += 0.05m;
            reasons.Add("Transaction occurred on a weekend.");
        }

        score = Math.Min(score, 0.99m);

        var riskLevel = score switch
        {
            >= 0.75m => "High",
            >= 0.45m => "Medium",
            _ => "Low"
        };

        if (reasons.Count == 0)
        {
            reasons.Add("No elevated risk signals detected.");
        }

        var response = new TransactionRiskPredictionResponse
        {
            RiskScore = decimal.Round(score, 2),
            RiskLevel = riskLevel,
            RequiresReview = score >= 0.45m,
            Reasons = reasons,
            ModelVersion = "rule-based-v1",
            ScoredAtUtc = DateTime.UtcNow
        };

        return Task.FromResult(response);
    }
}
"@

Set-Content -Path $riskServicePath -Value $riskServiceContent -Encoding UTF8

if ($hasInfrastructureProject) {
    $aiServicePath = "FinSight.Infrastructure\AI\EnterpriseAiInsightService.cs"
    $aiServiceNamespace = "FinSight.Infrastructure.AI"
}
else {
    $aiServicePath = "FinSight.Core\Services\AI\EnterpriseAiInsightService.cs"
    $aiServiceNamespace = "FinSight.Core.Services.AI"
}

$aiServiceContent = @"
using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;

namespace $aiServiceNamespace;

public class EnterpriseAiInsightService : IEnterpriseAiInsightService
{
    public Task<EnterpriseAiInsightResponse> GenerateInsightAsync(
        EnterpriseAiInsightRequest request,
        CancellationToken cancellationToken = default)
    {
        var signals = request.DataSignals
            .Where(signal => !string.IsNullOrWhiteSpace(signal))
            .Select(signal => signal.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var summary = signals.Count == 0
            ? `$"AI-assisted review prepared for {request.BusinessArea}. No specific data signals were provided."
            : `$"AI-assisted review prepared for {request.BusinessArea}. The scenario includes {signals.Count} relevant signal(s): {string.Join("; ", signals)}.";

        var recommendedActions = new List<string>
        {
            "Validate source data before taking action.",
            "Review related audit logs and transaction history.",
            "Confirm whether the scenario matches an approved business rule.",
            "Escalate to a human reviewer before any financial or account-impacting decision."
        };

        var guardrails = new List<string>
        {
            "No autonomous financial decisioning.",
            "Human review required for high-risk or account-impacting outcomes.",
            "Do not expose secrets, credentials, or sensitive customer data in prompts.",
            "Generated recommendations must be validated against system-of-record data."
        };

        var response = new EnterpriseAiInsightResponse
        {
            Summary = summary,
            RecommendedActions = recommendedActions,
            GuardrailsApplied = guardrails,
            ConfidenceLevel = signals.Count >= 3 ? "Medium" : "Low",
            GeneratedAtUtc = DateTime.UtcNow
        };

        return Task.FromResult(response);
    }
}
"@

Set-Content -Path $aiServicePath -Value $aiServiceContent -Encoding UTF8

# ------------------------------------------------------------
# API Controller
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

    public MlAiController(
        IMlRiskScoringService riskScoringService,
        IEnterpriseAiInsightService aiInsightService)
    {
        _riskScoringService = riskScoringService;
        _aiInsightService = aiInsightService;
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
}
'@ | Set-Content -Path "FinSight.Api\Controllers\MlAiController.cs" -Encoding UTF8

# ------------------------------------------------------------
# Documentation
# ------------------------------------------------------------

@'
# FinSight ML / AI Platform Foundation

## Purpose

This feature adds an enterprise-style ML and AI service boundary to FinSight.

It demonstrates:

- Transaction risk scoring
- AI-assisted operational insight generation
- Secure API contracts
- Separation of API, Core, ML, and Infrastructure concerns
- Human-in-the-loop guardrails
- Model versioning placeholder
- Future path for ML.NET, Azure AI, Databricks Model Serving, or an enterprise LLM gateway

## Current Implementation

The transaction risk service currently uses deterministic rule-based scoring.

The AI insight service currently returns controlled enterprise-style recommendations and guardrails.

No external AI provider is called yet.

## Why This Matters

This is intentionally designed like an enterprise application feature:

- API owns the external contract.
- Core owns DTOs and interfaces.
- ML or Core service owns scoring logic.
- Infrastructure or Core service owns AI-assisted insight generation.
- Human review is required before account-impacting or financial decisions.

## Future Enhancements

- Replace rule-based scoring with ML.NET inference.
- Serve models from Azure ML or Databricks Model Serving.
- Add prompt templates and approved enterprise guardrails.
- Add audit logging for every AI-assisted recommendation.
- Add model monitoring and drift checks.
- Add automated regression tests for AI and ML outputs.
'@ | Set-Content -Path "docs\ml-ai-platform-foundation.md" -Encoding UTF8

# ------------------------------------------------------------
# Add project references if optional projects exist
# ------------------------------------------------------------

if ($hasMlProject) {
    Write-Host "Detected FinSight.ML project. Adding project reference to API..." -ForegroundColor Cyan
    dotnet add "FinSight.ML\FinSight.ML.csproj" reference "FinSight.Core\FinSight.Core.csproj"
    dotnet add "FinSight.Api\FinSight.Api.csproj" reference "FinSight.ML\FinSight.ML.csproj"
}

if ($hasInfrastructureProject) {
    Write-Host "Detected FinSight.Infrastructure project. Adding project reference to API..." -ForegroundColor Cyan
    dotnet add "FinSight.Infrastructure\FinSight.Infrastructure.csproj" reference "FinSight.Core\FinSight.Core.csproj"
    dotnet add "FinSight.Api\FinSight.Api.csproj" reference "FinSight.Infrastructure\FinSight.Infrastructure.csproj"
}

# ------------------------------------------------------------
# Patch Program.cs
# ------------------------------------------------------------

$programPath = "FinSight.Api\Program.cs"

if (!(Test-Path $programPath)) {
    throw "Could not find Program.cs at $programPath"
}

$program = Get-Content $programPath -Raw

$usingLines = @(
    "using FinSight.Core.Interfaces;"
)

if ($hasMlProject) {
    $usingLines += "using FinSight.ML.Services;"
}
else {
    $usingLines += "using FinSight.Core.Services.AI;"
}

if ($hasInfrastructureProject) {
    $usingLines += "using FinSight.Infrastructure.AI;"
}
else {
    if ($usingLines -notcontains "using FinSight.Core.Services.AI;") {
        $usingLines += "using FinSight.Core.Services.AI;"
    }
}

foreach ($line in $usingLines) {
    if ($program -notmatch [regex]::Escape($line)) {
        $program = $line + [Environment]::NewLine + $program
    }
}

$diLines = @(
    "builder.Services.AddScoped<IMlRiskScoringService, RuleBasedTransactionRiskScoringService>();",
    "builder.Services.AddScoped<IEnterpriseAiInsightService, EnterpriseAiInsightService>();"
)

foreach ($diLine in $diLines) {
    if ($program -notmatch [regex]::Escape($diLine)) {
        $program = $program -replace "var app = builder\.Build\(\);", ($diLine + [Environment]::NewLine + "var app = builder.Build();")
    }
}

Set-Content -Path $programPath -Value $program -Encoding UTF8

# ------------------------------------------------------------
# Frontend folders
# ------------------------------------------------------------

$frontendFolders = @(
    "FinSight.Web\src\features\mlai",
    "FinSight.Web\src\features\mlai\api",
    "FinSight.Web\src\features\mlai\pages",
    "FinSight.Web\src\features\mlai\types"
)

foreach ($folder in $frontendFolders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# ------------------------------------------------------------
# Frontend types
# ------------------------------------------------------------

@'
export interface TransactionRiskPredictionRequest {
    accountId?: number;
    accountNumber?: string;
    amount: number;
    transactionType?: string;
    description?: string;
    transactionDate?: string;
    customerRiskRating?: string;
}

export interface TransactionRiskPredictionResponse {
    riskScore: number;
    riskLevel: string;
    requiresReview: boolean;
    reasons: string[];
    modelVersion: string;
    scoredAtUtc: string;
}

export interface EnterpriseAiInsightRequest {
    businessArea: string;
    scenario: string;
    userQuestion: string;
    dataSignals: string[];
}

export interface EnterpriseAiInsightResponse {
    summary: string;
    recommendedActions: string[];
    guardrailsApplied: string[];
    confidenceLevel: string;
    generatedAtUtc: string;
}
'@ | Set-Content -Path "FinSight.Web\src\features\mlai\types\mlAiTypes.ts" -Encoding UTF8

# ------------------------------------------------------------
# Detect frontend api client
# ------------------------------------------------------------

$apiClientImport = $null

if (Test-Path "FinSight.Web\src\lib\apiClient.ts") {
    $apiClientImport = '../../../lib/apiClient'
}
elseif (Test-Path "FinSight.Web\src\api\apiClient.ts") {
    $apiClientImport = '../../../api/apiClient'
}
elseif (Test-Path "FinSight.Web\src\services\apiClient.ts") {
    $apiClientImport = '../../../services/apiClient'
}
else {
    Write-Host "Could not find existing apiClient.ts. Creating mlAiApi.ts using fetch instead." -ForegroundColor Yellow
}

if ($apiClientImport) {
@"
import { apiClient } from "$apiClientImport";
import type {
    EnterpriseAiInsightRequest,
    EnterpriseAiInsightResponse,
    TransactionRiskPredictionRequest,
    TransactionRiskPredictionResponse
} from "../types/mlAiTypes";

export async function scoreTransactionRisk(
    request: TransactionRiskPredictionRequest
): Promise<TransactionRiskPredictionResponse> {
    const response = await apiClient.post<TransactionRiskPredictionResponse>(
        "/api/MlAi/transaction-risk",
        request
    );

    return response.data;
}

export async function generateEnterpriseInsight(
    request: EnterpriseAiInsightRequest
): Promise<EnterpriseAiInsightResponse> {
    const response = await apiClient.post<EnterpriseAiInsightResponse>(
        "/api/MlAi/enterprise-insight",
        request
    );

    return response.data;
}
"@ | Set-Content -Path "FinSight.Web\src\features\mlai\api\mlAiApi.ts" -Encoding UTF8
}
else {
@'
import type {
    EnterpriseAiInsightRequest,
    EnterpriseAiInsightResponse,
    TransactionRiskPredictionRequest,
    TransactionRiskPredictionResponse
} from "../types/mlAiTypes";

const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7029";

function getToken() {
    return localStorage.getItem("authToken") ?? localStorage.getItem("token");
}

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
    const token = getToken();

    const response = await fetch(`${apiBaseUrl}${url}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json() as Promise<TResponse>;
}

export async function scoreTransactionRisk(
    request: TransactionRiskPredictionRequest
): Promise<TransactionRiskPredictionResponse> {
    return postJson<TransactionRiskPredictionResponse>(
        "/api/MlAi/transaction-risk",
        request
    );
}

export async function generateEnterpriseInsight(
    request: EnterpriseAiInsightRequest
): Promise<EnterpriseAiInsightResponse> {
    return postJson<EnterpriseAiInsightResponse>(
        "/api/MlAi/enterprise-insight",
        request
    );
}
'@ | Set-Content -Path "FinSight.Web\src\features\mlai\api\mlAiApi.ts" -Encoding UTF8
}

# ------------------------------------------------------------
# Frontend page
# ------------------------------------------------------------

@'
import React from "react";
import {
    generateEnterpriseInsight,
    scoreTransactionRisk
} from "../api/mlAiApi";
import type {
    EnterpriseAiInsightResponse,
    TransactionRiskPredictionResponse
} from "../types/mlAiTypes";

export function MlAiPage() {
    const [amount, setAmount] = React.useState("12500");
    const [transactionType, setTransactionType] = React.useState("TransferOut");
    const [description, setDescription] = React.useState("Urgent offshore wire transfer");
    const [customerRiskRating, setCustomerRiskRating] = React.useState("High");

    const [scenario, setScenario] = React.useState(
        "A high-value outbound transaction was flagged for review."
    );
    const [question, setQuestion] = React.useState(
        "What should an analyst review before approving this activity?"
    );
    const [signals, setSignals] = React.useState(
        "High-value amount, outbound transfer, elevated customer risk, urgent wording"
    );

    const [riskResult, setRiskResult] =
        React.useState<TransactionRiskPredictionResponse | null>(null);

    const [insightResult, setInsightResult] =
        React.useState<EnterpriseAiInsightResponse | null>(null);

    const [loadingRisk, setLoadingRisk] = React.useState(false);
    const [loadingInsight, setLoadingInsight] = React.useState(false);
    const [error, setError] = React.useState("");

    async function handleScoreRisk() {
        try {
            setLoadingRisk(true);
            setError("");

            const result = await scoreTransactionRisk({
                amount: Number(amount),
                transactionType,
                description,
                customerRiskRating,
                transactionDate: new Date().toISOString()
            });

            setRiskResult(result);
        } catch (err) {
            console.error("Failed to score transaction risk:", err);
            setError("Failed to score transaction risk.");
        } finally {
            setLoadingRisk(false);
        }
    }

    async function handleGenerateInsight() {
        try {
            setLoadingInsight(true);
            setError("");

            const result = await generateEnterpriseInsight({
                businessArea: "Transactions",
                scenario,
                userQuestion: question,
                dataSignals: signals
                    .split(",")
                    .map((signal) => signal.trim())
                    .filter(Boolean)
            });

            setInsightResult(result);
        } catch (err) {
            console.error("Failed to generate enterprise insight:", err);
            setError("Failed to generate enterprise insight.");
        } finally {
            setLoadingInsight(false);
        }
    }

    return (
        <main className="page">
            <div className="page-header">
                <h1>ML / AI Risk Platform</h1>
                <p>
                    Enterprise-style transaction risk scoring and AI-assisted
                    operational insight review with human-in-the-loop guardrails.
                </p>
            </div>

            {error && <p className="error">{error}</p>}

            <div className="cards ml-ai-grid">
                <section className="card">
                    <h2>Transaction Risk Scoring</h2>
                    <p>
                        Demonstrates a safe ML service boundary for fraud, risk,
                        and analyst-review workflows.
                    </p>

                    <div className="form">
                        <label>
                            Amount
                            <input
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                            />
                        </label>

                        <label>
                            Transaction Type
                            <select
                                value={transactionType}
                                onChange={(event) => setTransactionType(event.target.value)}
                            >
                                <option value="Deposit">Deposit</option>
                                <option value="Withdrawal">Withdrawal</option>
                                <option value="TransferIn">Transfer In</option>
                                <option value="TransferOut">Transfer Out</option>
                            </select>
                        </label>

                        <label>
                            Description
                            <input
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                            />
                        </label>

                        <label>
                            Customer Risk Rating
                            <select
                                value={customerRiskRating}
                                onChange={(event) => setCustomerRiskRating(event.target.value)}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </label>

                        <button
                            type="button"
                            onClick={handleScoreRisk}
                            disabled={loadingRisk}
                        >
                            {loadingRisk ? "Scoring..." : "Score Risk"}
                        </button>
                    </div>

                    {riskResult && (
                        <div className="dashboard-section">
                            <div className="card">
                                <h2>{riskResult.riskLevel}</h2>
                                <p>Risk Score: {riskResult.riskScore}</p>
                                <p>
                                    Requires Review:{" "}
                                    {riskResult.requiresReview ? "Yes" : "No"}
                                </p>
                                <p>Model Version: {riskResult.modelVersion}</p>

                                <strong>Reasons</strong>
                                <ul>
                                    {riskResult.reasons.map((reason) => (
                                        <li key={reason}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </section>

                <section className="card">
                    <h2>AI-Assisted Enterprise Insight</h2>
                    <p>
                        Demonstrates guardrailed AI assistance for analyst support,
                        documentation, and operational troubleshooting.
                    </p>

                    <div className="form">
                        <label>
                            Scenario
                            <input
                                value={scenario}
                                onChange={(event) => setScenario(event.target.value)}
                            />
                        </label>

                        <label>
                            User Question
                            <input
                                value={question}
                                onChange={(event) => setQuestion(event.target.value)}
                            />
                        </label>

                        <label>
                            Data Signals
                            <input
                                value={signals}
                                onChange={(event) => setSignals(event.target.value)}
                            />
                        </label>

                        <button
                            type="button"
                            onClick={handleGenerateInsight}
                            disabled={loadingInsight}
                        >
                            {loadingInsight ? "Generating..." : "Generate Insight"}
                        </button>
                    </div>

                    {insightResult && (
                        <div className="dashboard-section">
                            <div className="card">
                                <h2>Insight</h2>
                                <p>{insightResult.summary}</p>
                                <p>Confidence: {insightResult.confidenceLevel}</p>

                                <strong>Recommended Actions</strong>
                                <ul>
                                    {insightResult.recommendedActions.map((action) => (
                                        <li key={action}>{action}</li>
                                    ))}
                                </ul>

                                <strong>Guardrails Applied</strong>
                                <ul>
                                    {insightResult.guardrailsApplied.map((guardrail) => (
                                        <li key={guardrail}>{guardrail}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
'@ | Set-Content -Path "FinSight.Web\src\features\mlai\pages\MlAiPage.tsx" -Encoding UTF8

# ------------------------------------------------------------
# Add CSS if globals.css exists
# ------------------------------------------------------------

$globalsPath = "FinSight.Web\src\styles\globals.css"

if (Test-Path $globalsPath) {
    $globals = Get-Content $globalsPath -Raw

    if ($globals -notmatch "ml-ai-grid") {
        @'

.ml-ai-grid {
    grid-template-columns: 1fr 1fr;
}

@media (max-width: 900px) {
    .ml-ai-grid {
        grid-template-columns: 1fr;
    }
}
'@ | Add-Content -Path $globalsPath -Encoding UTF8
    }
}

# ------------------------------------------------------------
# Build backend
# ------------------------------------------------------------

Write-Host "Restoring backend..." -ForegroundColor Cyan
dotnet restore

Write-Host "Building backend..." -ForegroundColor Cyan
dotnet build

# ------------------------------------------------------------
# Build frontend
# ------------------------------------------------------------

Write-Host "Building frontend..." -ForegroundColor Cyan

Set-Location "$repoRoot\FinSight.Web"

if (!(Test-Path "node_modules")) {
    Write-Host "node_modules not found. Running npm install..." -ForegroundColor Yellow
    npm install
}

npm run build

Set-Location $repoRoot

Write-Host ""
Write-Host "FinSight ML/AI files added successfully." -ForegroundColor Green
Write-Host ""
Write-Host "Manual next step: wire the route and nav link." -ForegroundColor Yellow
Write-Host "Import:"
Write-Host 'import { MlAiPage } from "./features/mlai/pages/MlAiPage";'
Write-Host ""
Write-Host "Route:"
Write-Host '<Route path="/ml-ai" element={<MlAiPage />} />'
Write-Host ""
Write-Host "Nav:"
Write-Host '<NavLink to="/ml-ai" className={getNavLinkClass}>ML / AI</NavLink>'