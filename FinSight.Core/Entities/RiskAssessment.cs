namespace FinSight.Core.Entities
{
    public class RiskAssessment
    {
        public int Id { get; set; }
        public int RiskScore { get; set; }
        public string RiskLevel { get; set; } = "Low";
        public string Reason { get; set; } = string.Empty;
        public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }
    }
}