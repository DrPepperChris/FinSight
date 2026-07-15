import { apiClient } from "../../../lib/apiClient";
import type {
    AgentChatRequest,
    AgentChatResponse,
    AgentDocumentExportRequest,
    AgentUploadedFileResponse,
    AiGuardrailConfigResponse,
    CodebaseAnalysisRequest,
    CodebaseAnalysisResponse,
    DocumentationUpdateRequest,
    DocumentationUpdateResponse,
    EnterpriseAiInsightRequest,
    EnterpriseAiInsightResponse,
    FeatureGenerationRequest,
    FeatureGenerationResponse,
    TransactionRiskPredictionRequest,
    TransactionRiskPredictionResponse
} from "../types/mlAiTypes";

export async function getAiGuardrails(): Promise<AiGuardrailConfigResponse> {
    const response = await apiClient.get<AiGuardrailConfigResponse>(
        "/api/MlAi/guardrails"
    );

    return response.data;
}

export async function scoreTransactionRisk(
    request: TransactionRiskPredictionRequest
): Promise<TransactionRiskPredictionResponse> {
    const response = await apiClient.post<TransactionRiskPredictionResponse>(
        "/api/MlAi/transaction-risk",
        request
    );

    return response.data;
}

export async function generateEnterpriseInsight(
    request: EnterpriseAiInsightRequest
): Promise<EnterpriseAiInsightResponse> {
    const response = await apiClient.post<EnterpriseAiInsightResponse>(
        "/api/MlAi/enterprise-insight",
        request
    );

    return response.data;
}

export async function analyzeCodebase(
    request: CodebaseAnalysisRequest
): Promise<CodebaseAnalysisResponse> {
    const response = await apiClient.post<CodebaseAnalysisResponse>(
        "/api/MlAi/codebase/analyze",
        request
    );

    return response.data;
}

export async function generateFeaturePlan(
    request: FeatureGenerationRequest
): Promise<FeatureGenerationResponse> {
    const response = await apiClient.post<FeatureGenerationResponse>(
        "/api/MlAi/feature-plan",
        request
    );

    return response.data;
}

export async function proposeDocumentationUpdate(
    request: DocumentationUpdateRequest
): Promise<DocumentationUpdateResponse> {
    const response = await apiClient.post<DocumentationUpdateResponse>(
        "/api/MlAi/documentation/propose",
        request
    );

    return response.data;
}

export async function uploadAgentFile(
    file: File
): Promise<AgentUploadedFileResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<AgentUploadedFileResponse>(
        "/api/MlAi/agent/upload",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
}

export async function chatWithAgent(
    request: AgentChatRequest
): Promise<AgentChatResponse> {
    const response = await apiClient.post<AgentChatResponse>(
        "/api/MlAi/agent/chat",
        request
    );

    return response.data;
}

export async function exportAgentDocumentDocx(
    request: AgentDocumentExportRequest
): Promise<Blob> {
    const response = await apiClient.post(
        "/api/MlAi/agent/export-docx",
        request,
        {
            responseType: "blob"
        }
    );

    return response.data;
}