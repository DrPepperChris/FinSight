namespace FinSight.Core.Entities
{
    public class LoanApplication
    {
        public int Id { get; set; }
        public string ApplicationNumber { get; set; } = string.Empty;
        public decimal RequestedAmount { get; set; }
        public string LoanType { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime ApplicationDate { get; set; } = DateTime.UtcNow;
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }
    }
}