// LoanApplicationDto.cs
using FinSight.Core.Enums;

namespace FinSight.Core.DTOs
{
    public class LoanApplicationDto
    {
        public int Id { get; set; }
        public string ApplicationNumber { get; set; } = string.Empty;
        public decimal RequestedAmount { get; set; }
        public string LoanType { get; set; } = string.Empty;
        public LoanStatus Status { get; set; }
        public DateTime ApplicationDate { get; set; }
        public DateTime? DecisionDate { get; set; }
        public string? DecisionReason { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
    }
}