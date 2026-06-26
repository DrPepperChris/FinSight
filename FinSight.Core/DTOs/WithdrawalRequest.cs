namespace FinSight.Core.DTOs
{
    public class WithdrawalRequest
    {
        public decimal Amount { get; set; }

        public string Description { get; set; } = string.Empty;
    }
}