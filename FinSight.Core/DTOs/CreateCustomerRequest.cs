namespace FinSight.Core.DTOs
{
    public class CreateCustomerRequest
    {
        public string CustomerNumber { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RiskRating { get; set; } = "Low";
    }
}