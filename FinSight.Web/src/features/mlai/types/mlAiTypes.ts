export interface TransactionRiskPredictionRequest {
    accountId?: number;
    accountNumber?: string;
    amount: number;
    transactionType?: string;
    description?: string;
    transactionDate?: string;
    customerRiskRating?: string;
}

export interface TransactionRiskPredictionResponse {
    riskScore: number;
    riskLevel: string;
    requiresReview: boolean;
    reasons: string[];
    modelVersion: string;
    scoredAtUtc: string;
}

export interface EnterpriseAiInsightRequest {
    businessArea: string;
    scenario: string;
    userQuestion: string;
    dataSignals: string[];
}

export interface EnterpriseAiInsightResponse {
    summary: string;
    recommendedActions: string[];
    guardrailsApplied: string[];
    confidenceLevel: string;
    generatedAtUtc: string;
}
