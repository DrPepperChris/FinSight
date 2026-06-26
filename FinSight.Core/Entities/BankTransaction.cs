using FinSight.Core.Enums;

namespace FinSight.Core.Entities
{
    public class BankTransaction
    {
        public int Id { get; set; }

        public string TransactionNumber { get; set; } = string.Empty;

        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        public TransactionType TransactionType { get; set; }

        public decimal Amount { get; set; }

        public decimal BalanceAfterTransaction { get; set; }

        public string Description { get; set; } = string.Empty;

        public string ReferenceNumber { get; set; } = string.Empty;

        public int AccountId { get; set; }

        public Account? Account { get; set; }
    }
}