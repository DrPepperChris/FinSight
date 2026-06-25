namespace FinSight.Core.Entities
{
    public class BankTransaction
    {
        public int Id { get; set; }
        public string TransactionNumber { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public decimal Amount { get; set; }
        public string Merchant { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string TransactionType { get; set; } = string.Empty;
        public int AccountId { get; set; }
        public Account? Account { get; set; }
    }
}