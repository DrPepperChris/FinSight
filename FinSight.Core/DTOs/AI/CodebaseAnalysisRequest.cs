namespace FinSight.Core.DTOs.AI;

public class CodebaseAnalysisRequest
{
    public string? RepoRoot { get; set; }
    public int? MaxFiles { get; set; }

    public List<string> IncludeExtensions { get; set; } = new()
    {
        ".cs",
        ".tsx",
        ".ts",
        ".md",
        ".json"
    };
}
