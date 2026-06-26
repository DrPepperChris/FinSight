namespace FinSight.Core.DTOs
{
    public class TransactionDto
    {
        public int Id { get; set; }

        public int AccountId { get; set; }

        public decimal Amount { get; set; }

        public string TransactionType { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime TransactionDate { get; set; }
    }
}