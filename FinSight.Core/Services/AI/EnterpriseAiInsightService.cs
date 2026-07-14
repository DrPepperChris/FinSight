using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;

namespace FinSight.Core.Services.AI;

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
            ? $"AI-assisted review prepared for {request.BusinessArea}. No specific data signals were provided."
            : $"AI-assisted review prepared for {request.BusinessArea}. The scenario includes {signals.Count} relevant signal(s): {string.Join("; ", signals)}.";

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
