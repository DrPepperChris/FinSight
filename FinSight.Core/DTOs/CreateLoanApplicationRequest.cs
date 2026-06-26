// CreateLoanApplicationRequest.cs
namespace FinSight.Core.DTOs
{
    public class CreateLoanApplicationRequest
    {
        public decimal RequestedAmount { get; set; }
        public string LoanType { get; set; } = string.Empty;
        public int CustomerId { get; set; }
    }
}