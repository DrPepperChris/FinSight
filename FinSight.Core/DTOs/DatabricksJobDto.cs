namespace FinSight.Core.DTOs
{
    public class DatabricksJobValidationRequestDto
    {
        public string SourceType { get; set; } = string.Empty;
        public string BronzeTable { get; set; } = string.Empty;
        public string SilverTable { get; set; } = string.Empty;
        public string GoldTable { get; set; } = string.Empty;
        public List<string> Transformations { get; set; } = new();
        public string GoldOutputName { get; set; } = string.Empty;
    }

    public class DatabricksJobValidationResultDto
    {
        public bool IsValid { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<string> Messages { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    public class DatabricksJobRunRequestDto
    {
        public string SourceType { get; set; } = string.Empty;
        public string BronzeTable { get; set; } = string.Empty;
        public string SilverTable { get; set; } = string.Empty;
        public string GoldTable { get; set; } = string.Empty;
        public List<string> Transformations { get; set; } = new();
        public string GoldOutputName { get; set; } = string.Empty;
    }

    public class DatabricksJobRunResultDto
    {
        public string RunId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string SubmittedAtUtc { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public List<string> PlannedSteps { get; set; } = new();
    }

    public class DatabricksJobStatusDto
    {
        public string RunId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int PercentComplete { get; set; }
        public string LastUpdatedUtc { get; set; } = string.Empty;
        public List<string> CompletedSteps { get; set; } = new();
        public string Message { get; set; } = string.Empty;
    }
}