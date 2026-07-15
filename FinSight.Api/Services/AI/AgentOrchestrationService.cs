using System.Text;
using FinSight.Core.DTOs.AI;
using FinSight.Core.Interfaces;

namespace FinSight.Api.Services.AI;

public class AgentOrchestrationService : IAgentOrchestrationService
{
    private readonly IAiGuardrailService _guardrailService;
    private readonly ICodebaseContextService _codebaseContextService;
    private readonly IAgenticFeaturePlanningService _featurePlanningService;
    private readonly IDocumentationProposalService _documentationProposalService;
    private readonly IEnterpriseAiInsightService _enterpriseAiInsightService;

    public AgentOrchestrationService(
        IAiGuardrailService guardrailService,
        ICodebaseContextService codebaseContextService,
        IAgenticFeaturePlanningService featurePlanningService,
        IDocumentationProposalService documentationProposalService,
        IEnterpriseAiInsightService enterpriseAiInsightService)
    {
        _guardrailService = guardrailService;
        _codebaseContextService = codebaseContextService;
        _featurePlanningService = featurePlanningService;
        _documentationProposalService = documentationProposalService;
        _enterpriseAiInsightService = enterpriseAiInsightService;
    }

    public async Task<AgentChatResponse> ChatAsync(
        AgentChatRequest request,
        CancellationToken cancellationToken = default)
    {
        var guardrails = _guardrailService.GetCurrentGuardrails();
        var intent = DetectIntent(request.Message);

        var response = new AgentChatResponse
        {
            ResponseType = intent,
            GuardrailsApplied = guardrails.GuardrailsApplied.ToList(),
            FilesConsidered = request.UploadedFileIds,
            PipelineStages = new()
            {
                "Agent request received.",
                "Guardrails loaded.",
                $"Detected intent: {intent}.",
                "Human review required before production-impacting changes."
            }
        };

        if (request.UploadedFileIds.Count > 0)
        {
            response.PipelineStages.Add("Uploaded file references attached to the agent request.");
            response.PipelineStages.Add("Bronze knowledge can be used only as unapproved context until promoted.");
        }

        if (intent == "CompanyStandardDocument")
        {
            return GenerateCompanyStandardDocumentResponse(request, response);
        }

        if (intent == "CompanyKnowledge")
        {
            return await GenerateCompanyKnowledgeResponse(
                request,
                response,
                cancellationToken);
        }

        if (intent == "FeaturePlan")
        {
            return await GenerateFeaturePlanResponse(
                request,
                response,
                cancellationToken);
        }

        if (intent == "Documentation")
        {
            return await GenerateDocumentationResponse(
                request,
                response,
                cancellationToken);
        }

        if (intent == "CodebaseAnalysis")
        {
            return await GenerateCodebaseAnalysisResponse(
                guardrails,
                response,
                cancellationToken);
        }

        var insight = await _enterpriseAiInsightService.GenerateInsightAsync(
            new EnterpriseAiInsightRequest
            {
                BusinessArea = "AI Agent",
                Scenario = "User asked the FinSight AI Agent for assistance.",
                UserQuestion = request.Message,
                DataSignals = request.UploadedFileIds.Count > 0
                    ? new() { "Uploaded files attached", "Guardrails required", "Human review required" }
                    : new() { "No uploaded files attached", "Guardrails required", "Human review required" }
            },
            cancellationToken);

        response.Answer = insight.Summary;
        response.RecommendedActions = insight.RecommendedActions;
        response.GuardrailsApplied = insight.GuardrailsApplied;

        return response;
    }

    private static AgentChatResponse GenerateCompanyStandardDocumentResponse(
        AgentChatRequest request,
        AgentChatResponse response)
    {
        response.Answer =
            "I generated a draft company code logic standard. This is a proposed standard only. It should not be treated as approved or enforced across business units until it is reviewed and approved.";

        response.ProposedMarkdown = BuildCompanyStandardMarkdown(request.Message);

        response.RecommendedActions = new()
        {
            "Review the proposed company standard for accuracy.",
            "Confirm the standard fits existing FinSight controller, service, DTO, interface, and React feature patterns.",
            "Identify any business-unit exceptions before approval.",
            "Approve the document before promoting it to Gold company knowledge.",
            "After approval, use this as the reference standard for future generated code and documentation."
        };

        response.PipelineStages.Add("Draft company standard generated.");
        response.PipelineStages.Add("Document remains in Silver proposal state until reviewed.");
        response.PipelineStages.Add("Gold promotion requires explicit human approval.");

        response.GuardrailsApplied.Add("Generated standards are draft-only until approved.");
        response.GuardrailsApplied.Add("Business-unit-wide standards require human review before adoption.");
        response.GuardrailsApplied.Add("The agent must not automatically enforce this standard in code generation until approved.");

        return response;
    }

    private async Task<AgentChatResponse> GenerateCompanyKnowledgeResponse(
        AgentChatRequest request,
        AgentChatResponse response,
        CancellationToken cancellationToken)
    {
        var featurePlan = await _featurePlanningService.GenerateFeaturePlanAsync(
            new FeatureGenerationRequest
            {
                FeatureName = "Company Knowledge Intelligence",
                BusinessGoal = request.Message,
                TargetArea = "AI Agent, Data Pipeline, Documentation, Code Standards",
                Requirements = new()
                {
                    "Use chat-style text input",
                    "Support file uploads",
                    "Scan uploads before processing",
                    "Use Bronze Silver Gold ETL layers",
                    "Prefer existing code patterns",
                    "Generate reviewable proposals only",
                    "Prepare for Azure-hosted LLM integration"
                },
                ReuseExistingMethodsFirst = true
            },
            cancellationToken);

        response.Answer =
            "I created a reuse-first implementation plan for a FinSight AI Agent backed by a governed upload and ETL pipeline. The design keeps uploaded files in Bronze until scanned, normalizes approved content into Silver, and promotes reviewed company standards into Gold.";

        response.ProposedFiles = featurePlan.ProposedFiles;
        response.ImplementationSteps = featurePlan.ImplementationSteps;
        response.RecommendedActions = new()
        {
            "Create the chat-style agent endpoint and UI.",
            "Store uploads in the Bronze layer after scan checks pass.",
            "Add Silver extraction for text, code, markdown, screenshots, PDFs, and Word documents.",
            "Require approval before promoting generated standards to Gold.",
            "Use Azure Blob Storage, Azure AI Search, and Azure OpenAI when deployed."
        };

        return response;
    }

    private async Task<AgentChatResponse> GenerateFeaturePlanResponse(
        AgentChatRequest request,
        AgentChatResponse response,
        CancellationToken cancellationToken)
    {
        var featurePlan = await _featurePlanningService.GenerateFeaturePlanAsync(
            new FeatureGenerationRequest
            {
                FeatureName = ExtractFeatureName(request.Message),
                BusinessGoal = request.Message,
                TargetArea = "FinSight Application",
                Requirements = new()
                {
                    "Reuse existing methods first",
                    "Follow existing DTO, service, controller, and React patterns",
                    "Generate reviewable proposals only",
                    "Include backend and frontend test plan",
                    "Apply existing guardrails"
                },
                ReuseExistingMethodsFirst = true
            },
            cancellationToken);

        response.Answer = featurePlan.Summary;
        response.ProposedFiles = featurePlan.ProposedFiles;
        response.ImplementationSteps = featurePlan.ImplementationSteps;
        response.RecommendedActions = featurePlan.TestPlan;

        foreach (var guardrail in featurePlan.GuardrailsApplied)
        {
            if (!response.GuardrailsApplied.Contains(guardrail))
            {
                response.GuardrailsApplied.Add(guardrail);
            }
        }

        return response;
    }

    private async Task<AgentChatResponse> GenerateDocumentationResponse(
        AgentChatRequest request,
        AgentChatResponse response,
        CancellationToken cancellationToken)
    {
        var documentation = await _documentationProposalService.GenerateDocumentationProposalAsync(
            new DocumentationUpdateRequest
            {
                Topic = ExtractDocumentationTopic(request.Message),
                ChangeSummary = request.Message,
                TargetDocumentName = "docs/generated-agent-documentation-proposal.md",
                MatchExistingDocumentationStyle = true
            },
            cancellationToken);

        response.Answer =
            "I generated a documentation proposal using the existing FinSight documentation style and enterprise guardrails.";

        response.ProposedMarkdown = documentation.ProposedMarkdown;
        response.RecommendedActions = new()
        {
            "Review the proposed markdown.",
            "Confirm naming and format match the existing documentation conventions.",
            "Approve the document before treating it as an official standard."
        };

        response.PipelineStages.Add("Documentation proposal generated.");
        response.PipelineStages.Add("Proposal remains in Silver until reviewed.");
        response.PipelineStages.Add("Gold promotion requires explicit approval.");

        return response;
    }

    private async Task<AgentChatResponse> GenerateCodebaseAnalysisResponse(
        AiGuardrailConfigResponse guardrails,
        AgentChatResponse response,
        CancellationToken cancellationToken)
    {
        var analysis = await _codebaseContextService.AnalyzeCodebaseAsync(
            new CodebaseAnalysisRequest
            {
                MaxFiles = guardrails.MaxFilesToScan
            },
            cancellationToken);

        response.Answer =
            $"I scanned {analysis.FilesScanned} files and identified reusable project patterns, naming conventions, and candidate methods.";

        response.RecommendedActions = analysis.ProjectPatterns
            .Concat(analysis.NamingConventions)
            .Concat(analysis.Warnings)
            .Distinct()
            .ToList();

        return response;
    }

    private static string DetectIntent(string message)
    {
        if (ContainsAny(
                message,
                "company standard",
                "company standards",
                "standard for the company",
                "used for all business units",
                "business units",
                "single code logic",
                "code logic",
                "only after i review",
                "after i review",
                "draft standard",
                "approved standard"))
        {
            return "CompanyStandardDocument";
        }

        if (ContainsAny(
                message,
                "llm",
                "agent",
                "upload",
                "uploads",
                "documents",
                "document upload",
                "standards",
                "knowledge",
                "etl",
                "pipeline",
                "bronze",
                "silver",
                "gold"))
        {
            return "CompanyKnowledge";
        }

        if (ContainsAny(
                message,
                "documentation",
                "document",
                "readme",
                "docs",
                "markdown",
                "write up",
                "write-up",
                "generate a document",
                "create a document"))
        {
            return "Documentation";
        }

        if (ContainsAny(
                message,
                "feature",
                "implement",
                "implementation plan",
                "build",
                "add"))
        {
            return "FeaturePlan";
        }

        if (ContainsAny(
                message,
                "codebase",
                "reuse",
                "existing methods",
                "scan repo",
                "existing code",
                "current code"))
        {
            return "CodebaseAnalysis";
        }

        return "GeneralInsight";
    }

    private static string ExtractFeatureName(string message)
    {
        if (ContainsAny(message, "llm", "agent", "knowledge", "upload", "standards"))
        {
            return "Company Knowledge Intelligence";
        }

        if (ContainsAny(message, "document", "documentation", "standard"))
        {
            return "Company Standard Document";
        }

        return "Agent Generated Feature";
    }

    private static string ExtractDocumentationTopic(string message)
    {
        if (ContainsAny(message, "standard", "standards", "code logic", "business units"))
        {
            return "Company Code Logic Standard";
        }

        if (ContainsAny(message, "azure", "deploy", "deployment"))
        {
            return "Azure Deployment Plan";
        }

        if (ContainsAny(message, "pipeline", "etl", "bronze", "silver", "gold"))
        {
            return "FinSight AI Agent Pipeline";
        }

        return "Generated Agent Documentation";
    }

    private static string BuildCompanyStandardMarkdown(string originalRequest)
    {
        var markdown = new StringBuilder();

        markdown.AppendLine("# Company Code Logic Standard");
        markdown.AppendLine();
        markdown.AppendLine("## Status");
        markdown.AppendLine();
        markdown.AppendLine("Draft for review.");
        markdown.AppendLine();
        markdown.AppendLine("This document is a proposed company standard. It must be reviewed and approved before it is treated as an official standard across business units.");
        markdown.AppendLine();
        markdown.AppendLine("## Purpose");
        markdown.AppendLine();
        markdown.AppendLine("Define a single reusable code logic pattern that can be applied consistently across FinSight business units and future feature development.");
        markdown.AppendLine();
        markdown.AppendLine("## Original Request");
        markdown.AppendLine();
        markdown.AppendLine(originalRequest);
        markdown.AppendLine();
        markdown.AppendLine("## Standard");
        markdown.AppendLine();
        markdown.AppendLine("All reusable business logic should be implemented behind a service boundary and exposed through explicit DTO contracts.");
        markdown.AppendLine();
        markdown.AppendLine("The preferred pattern is:");
        markdown.AppendLine();
        markdown.AppendLine("1. Define request and response DTOs in the Core project.");
        markdown.AppendLine("2. Define an interface for the business capability.");
        markdown.AppendLine("3. Implement the service behind that interface.");
        markdown.AppendLine("4. Expose the behavior through a controller endpoint.");
        markdown.AppendLine("5. Consume the endpoint through the shared frontend API client.");
        markdown.AppendLine("6. Keep generated output reviewable before it becomes an approved standard.");
        markdown.AppendLine();
        markdown.AppendLine("## Required Code Structure");
        markdown.AppendLine();
        markdown.AppendLine("FinSight.Core/DTOs/FeatureName/FeatureNameRequest.cs");
        markdown.AppendLine("FinSight.Core/DTOs/FeatureName/FeatureNameResponse.cs");
        markdown.AppendLine("FinSight.Core/Interfaces/IFeatureNameService.cs");
        markdown.AppendLine("FinSight.Api/Services/Area/FeatureNameService.cs");
        markdown.AppendLine("FinSight.Api/Controllers/FeatureNameController.cs");
        markdown.AppendLine("FinSight.Web/src/features/featureName/api/featureNameApi.ts");
        markdown.AppendLine("FinSight.Web/src/features/featureName/types/featureNameTypes.ts");
        markdown.AppendLine("FinSight.Web/src/features/featureName/pages/FeatureNamePage.tsx");
        markdown.AppendLine();
        markdown.AppendLine("## Rules");
        markdown.AppendLine();
        markdown.AppendLine("- Reuse existing methods before creating new logic.");
        markdown.AppendLine("- Keep DTOs explicit and purpose-specific.");
        markdown.AppendLine("- Keep controller actions thin.");
        markdown.AppendLine("- Keep business logic inside services.");
        markdown.AppendLine("- Use dependency injection for service boundaries.");
        markdown.AppendLine("- Use the shared frontend apiClient for HTTP calls.");
        markdown.AppendLine("- Require human review before promoting generated standards to approved company knowledge.");
        markdown.AppendLine("- Do not include secrets, credentials, tokens, or connection strings in documentation or generated code.");
        markdown.AppendLine();
        markdown.AppendLine("## Review Checklist");
        markdown.AppendLine();
        markdown.AppendLine("- Does this standard match the existing FinSight architecture?");
        markdown.AppendLine("- Does it support multiple business units?");
        markdown.AppendLine("- Does it avoid duplicating existing methods?");
        markdown.AppendLine("- Does it follow current DTO, service, controller, and React feature conventions?");
        markdown.AppendLine("- Has it been reviewed before Gold promotion?");
        markdown.AppendLine();
        markdown.AppendLine("## Approval");
        markdown.AppendLine();
        markdown.AppendLine("Approved By:");
        markdown.AppendLine();
        markdown.AppendLine("Approval Date:");
        markdown.AppendLine();
        markdown.AppendLine("Notes:");

        return markdown.ToString();
    }

    private static bool ContainsAny(string value, params string[] terms)
    {
        return terms.Any(term =>
            value.Contains(term, StringComparison.OrdinalIgnoreCase));
    }
}