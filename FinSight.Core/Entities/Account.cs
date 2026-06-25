namespace FinSight.Core.Entities
{
    public class Account
    {
        public int Id { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountType { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public DateTime OpenDate { get; set; } = DateTime.UtcNow;
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }
    }
}