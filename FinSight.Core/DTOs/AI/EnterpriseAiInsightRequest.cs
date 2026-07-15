namespace FinSight.Core.DTOs.AI;

public class EnterpriseAiInsightRequest
{
    public string BusinessArea { get; set; } = "Transactions";
    public string Scenario { get; set; } = string.Empty;
    public string UserQuestion { get; set; } = string.Empty;
    public List<string> DataSignals { get; set; } = new();
}
