using FinSight.Core.Enums;

namespace FinSight.Core.DTOs
{
    public class CreateAccountRequest
    {
        public string AccountNumber { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public decimal InitialDeposit { get; set; }
        public decimal InterestRate { get; set; }
        public int CustomerId { get; set; }
    }
}