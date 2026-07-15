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
        "approved standard",
        "use this file as a reference",
        "use this file as a standard",
        "reference standard",
        "reference / standard",
        "unit test standard",
        "unit tests",
        "unit test",
        "testing standard",
        "test standard",
        "standard for unit tests",
        "standard for testing"))
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
    var isCustomerExample = ContainsAny(originalRequest, "customer", "customers");
    var wantsUml = ContainsAny(originalRequest, "uml", "diagram", "dependencies", "connections");
    var wantsDocx = ContainsAny(originalRequest, "docx", "word document", "document");

    markdown.AppendLine("# FinSight Company Code Logic Standard");
    markdown.AppendLine();
    markdown.AppendLine("## Document Status");
    markdown.AppendLine();
    markdown.AppendLine("Status: Draft for review");
    markdown.AppendLine();
    markdown.AppendLine("Approval Required: Yes");
    markdown.AppendLine();
    markdown.AppendLine("Gold Knowledge Promotion: Not approved");
    markdown.AppendLine();
    markdown.AppendLine("This document is a proposed company standard. It must be reviewed and approved before it is treated as an official standard across business units.");
    markdown.AppendLine();

    if (wantsDocx)
    {
        markdown.AppendLine("## DOCX Export Intent");
        markdown.AppendLine();
        markdown.AppendLine("This proposal is structured so it can later be exported into a DOCX company standard document with headings, diagrams, approval fields, and version history.");
        markdown.AppendLine();
    }

    markdown.AppendLine("## Purpose");
    markdown.AppendLine();
    markdown.AppendLine("Define a reusable code logic standard that can be applied consistently across FinSight business units, APIs, services, DTOs, frontend features, and database-backed workflows.");
    markdown.AppendLine();
    markdown.AppendLine("## Original Request");
    markdown.AppendLine();
    markdown.AppendLine(originalRequest);
    markdown.AppendLine();

    markdown.AppendLine("## Standard Summary");
    markdown.AppendLine();
    markdown.AppendLine("All reusable business logic should be implemented behind explicit service boundaries and exposed through clear DTO contracts. Controllers should remain thin, services should own business rules, data access should remain isolated, and frontend features should use the shared API client.");
    markdown.AppendLine();

    markdown.AppendLine("## Required Pattern");
    markdown.AppendLine();
    markdown.AppendLine("1. Define request and response DTOs in the Core project.");
    markdown.AppendLine("2. Define an interface for the business capability.");
    markdown.AppendLine("3. Implement the service behind that interface.");
    markdown.AppendLine("4. Keep controller actions thin and focused on request/response behavior.");
    markdown.AppendLine("5. Keep data access behind repository, DbContext, or service-layer abstractions.");
    markdown.AppendLine("6. Consume backend endpoints through the shared frontend apiClient.");
    markdown.AppendLine("7. Add tests for validation, authorization, happy path, and failure path.");
    markdown.AppendLine("8. Keep generated standards draft-only until approved.");
    markdown.AppendLine();

    if (isCustomerExample)
    {
        markdown.AppendLine("## First Example: Customers Business Logic Unit");
        markdown.AppendLine();
        markdown.AppendLine("The Customers feature should act as the first reference implementation for this standard.");
        markdown.AppendLine();
        markdown.AppendLine("### Customer Logic Responsibilities");
        markdown.AppendLine();
        markdown.AppendLine("- Validate customer creation requests.");
        markdown.AppendLine("- Prevent duplicate customer records where applicable.");
        markdown.AppendLine("- Return DTOs instead of exposing database entities directly.");
        markdown.AppendLine("- Enforce role-based access through controller authorization.");
        markdown.AppendLine("- Keep business validation in the service layer.");
        markdown.AppendLine("- Keep frontend access behind the shared apiClient.");
        markdown.AppendLine();

        markdown.AppendLine("### Expected Customer Code Boundaries");
        markdown.AppendLine();
        markdown.AppendLine("- CustomersController: handles HTTP request/response and authorization.");
        markdown.AppendLine("- ICustomerService: defines the business capability contract.");
        markdown.AppendLine("- CustomerService: owns customer business rules and orchestration.");
        markdown.AppendLine("- CustomerDto / CreateCustomerRequest: define external API contracts.");
        markdown.AppendLine("- Customer entity/table: stores persisted customer data.");
        markdown.AppendLine("- customersApi.ts: frontend API wrapper using shared apiClient.");
        markdown.AppendLine("- CustomersPage.tsx: frontend user experience.");
        markdown.AppendLine();
    }

    if (wantsUml || isCustomerExample)
    {
        markdown.AppendLine("## UML / Dependency Diagram");
        markdown.AppendLine();
        markdown.AppendLine("The following Mermaid diagram can be rendered in supported markdown tools and later converted into a DOCX diagram image.");
        markdown.AppendLine();
        markdown.AppendLine("```mermaid");
        markdown.AppendLine("flowchart TD");
        markdown.AppendLine("    User[Authorized User]");
        markdown.AppendLine("    ReactPage[CustomersPage.tsx]");
        markdown.AppendLine("    ApiClient[Shared apiClient]");
        markdown.AppendLine("    Controller[CustomersController]");
        markdown.AppendLine("    ServiceInterface[ICustomerService]");
        markdown.AppendLine("    Service[CustomerService]");
        markdown.AppendLine("    Dtos[Customer DTOs]");
        markdown.AppendLine("    DbContext[FinSight DbContext]");
        markdown.AppendLine("    CustomerTable[(Customers Table)]");
        markdown.AppendLine("    AuditLogs[(Audit Logs)]");
        markdown.AppendLine();
        markdown.AppendLine("    User --> ReactPage");
        markdown.AppendLine("    ReactPage --> ApiClient");
        markdown.AppendLine("    ApiClient --> Controller");
        markdown.AppendLine("    Controller --> Dtos");
        markdown.AppendLine("    Controller --> ServiceInterface");
        markdown.AppendLine("    ServiceInterface --> Service");
        markdown.AppendLine("    Service --> DbContext");
        markdown.AppendLine("    DbContext --> CustomerTable");
        markdown.AppendLine("    Service --> AuditLogs");
        markdown.AppendLine("```");
        markdown.AppendLine();
    }

    markdown.AppendLine("## Database Table Dependencies");
    markdown.AppendLine();

    if (isCustomerExample)
    {
        markdown.AppendLine("| Table | Purpose | Used By | Notes |");
        markdown.AppendLine("|---|---|---|---|");
        markdown.AppendLine("| Customers | Stores customer profile records | CustomerService, CustomersController | Should not be exposed directly to the frontend |");
        markdown.AppendLine("| Accounts | Linked financial accounts | AccountService, Customers views where applicable | Customer dependency should be read through service/API boundaries |");
        markdown.AppendLine("| Transactions | Customer-related account activity | Transaction services and analytics | Should be accessed through transaction/account logic, not directly from customer UI |");
        markdown.AppendLine("| AuditLogs | Tracks business/system actions | Audit services, compliance views | Should capture important AI/documentation/standard changes later |");
    }
    else
    {
        markdown.AppendLine("Database dependencies should be listed for each business unit before the standard is approved.");
    }

    markdown.AppendLine();
    markdown.AppendLine("## Standard File Structure");
    markdown.AppendLine();
    markdown.AppendLine("FinSight.Core/DTOs/<FeatureName>/<FeatureName>Request.cs");
    markdown.AppendLine("FinSight.Core/DTOs/<FeatureName>/<FeatureName>Response.cs");
    markdown.AppendLine("FinSight.Core/Interfaces/I<FeatureName>Service.cs");
    markdown.AppendLine("FinSight.Api/Services/<Area>/<FeatureName>Service.cs");
    markdown.AppendLine("FinSight.Api/Controllers/<FeatureName>Controller.cs");
    markdown.AppendLine("FinSight.Web/src/features/<featureName>/api/<featureName>Api.ts");
    markdown.AppendLine("FinSight.Web/src/features/<featureName>/types/<featureName>Types.ts");
    markdown.AppendLine("FinSight.Web/src/features/<featureName>/pages/<FeatureName>Page.tsx");
    markdown.AppendLine();

    markdown.AppendLine("## Company-Wide Rules");
    markdown.AppendLine();
    markdown.AppendLine("- Reuse existing methods before creating new logic.");
    markdown.AppendLine("- Keep DTOs explicit and purpose-specific.");
    markdown.AppendLine("- Keep controller actions thin.");
    markdown.AppendLine("- Keep business logic inside services.");
    markdown.AppendLine("- Use dependency injection for service boundaries.");
    markdown.AppendLine("- Use the shared frontend apiClient for HTTP calls.");
    markdown.AppendLine("- Add authorization and role validation where needed.");
    markdown.AppendLine("- Add audit logging for company-standard changes and AI-assisted proposals.");
    markdown.AppendLine("- Require human review before promoting generated standards to approved company knowledge.");
    markdown.AppendLine("- Do not include secrets, credentials, tokens, or connection strings in documentation or generated code.");
    markdown.AppendLine();

    markdown.AppendLine("## Review Checklist");
    markdown.AppendLine();
    markdown.AppendLine("- Does this standard match the existing FinSight architecture?");
    markdown.AppendLine("- Does it support multiple business units?");
    markdown.AppendLine("- Does it avoid duplicating existing methods?");
    markdown.AppendLine("- Does it follow current DTO, service, controller, and React feature conventions?");
    markdown.AppendLine("- Are database dependencies clearly documented?");
    markdown.AppendLine("- Are upstream and downstream business logic dependencies documented?");
    markdown.AppendLine("- Has the document been reviewed before Gold promotion?");
    markdown.AppendLine();

    markdown.AppendLine("## Approval");
    markdown.AppendLine();
    markdown.AppendLine("Approved By:");
    markdown.AppendLine();
    markdown.AppendLine("Approval Date:");
    markdown.AppendLine();
    markdown.AppendLine("Business Units Covered:");
    markdown.AppendLine();
    markdown.AppendLine("Exceptions:");
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