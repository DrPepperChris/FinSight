namespace FinSight.Core.Entities
{
    public class Customer
    {
        public int Id { get; set; }

        public string CustomerNumber { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string RiskRating { get; set; } = "Low";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}