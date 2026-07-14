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
