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
