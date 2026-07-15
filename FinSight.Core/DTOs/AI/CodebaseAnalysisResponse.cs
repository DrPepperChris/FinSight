namespace FinSight.Core.DTOs.AI;

public class CodebaseAnalysisResponse
{
    public string RootPath { get; set; } = string.Empty;
    public int FilesScanned { get; set; }
    public List<string> ProjectPatterns { get; set; } = new();
    public List<string> ExistingMethodsToReuse { get; set; } = new();
    public List<string> NamingConventions { get; set; } = new();
    public List<string> CandidateFiles { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public DateTime AnalyzedAtUtc { get; set; } = DateTime.UtcNow;
}
