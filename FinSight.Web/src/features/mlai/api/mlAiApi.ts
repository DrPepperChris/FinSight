import { apiClient } from "../../../lib/apiClient";
import type {
    EnterpriseAiInsightRequest,
    EnterpriseAiInsightResponse,
    TransactionRiskPredictionRequest,
    TransactionRiskPredictionResponse
} from "../types/mlAiTypes";

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
