namespace FinSight.Core.DTOs
{
    public class DepositRequest
    {
        public decimal Amount { get; set; }

        public string Description { get; set; } = string.Empty;
    }
}