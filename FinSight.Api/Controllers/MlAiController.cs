using FinSight.Api.Services.AI;
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