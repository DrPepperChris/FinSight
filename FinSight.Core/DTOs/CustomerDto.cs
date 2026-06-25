namespace FinSight.Core.DTOs
{
    public class CustomerDto
    {
        public int Id { get; set; }
        public string CustomerNumber { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RiskRating { get; set; } = string.Empty;
    }
}