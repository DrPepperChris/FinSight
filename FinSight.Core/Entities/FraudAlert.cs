namespace FinSight.Core.Entities
{
    public class FraudAlert
    {
        public int Id { get; set; }
        public string AlertNumber { get; set; } = string.Empty;
        public string AlertReason { get; set; } = string.Empty;
        public string RiskLevel { get; set; } = "Medium";
        public string Status { get; set; } = "Open";
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public int BankTransactionId { get; set; }
        public BankTransaction? BankTransaction { get; set; }
    }
}