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

export interface AiGuardrailConfigResponse {
    humanReviewRequired: boolean;
    allowCodeGeneration: boolean;
    allowFileWriteBack: boolean;
    allowDocumentationProposals: boolean;
    maxFilesToScan: number;
    protectedPaths: string[];
    blockedTerms: string[];
    approvedUseCases: string[];
    guardrailsApplied: string[];
    loadedAtUtc: string;
}

export interface CodebaseAnalysisRequest {
    repoRoot?: string;
    maxFiles?: number;
    includeExtensions: string[];
}

export interface CodebaseAnalysisResponse {
    rootPath: string;
    filesScanned: number;
    projectPatterns: string[];
    existingMethodsToReuse: string[];
    namingConventions: string[];
    candidateFiles: string[];
    warnings: string[];
    analyzedAtUtc: string;
}

export interface FeatureGenerationRequest {
    featureName: string;
    businessGoal: string;
    targetArea: string;
    requirements: string[];
    reuseExistingMethodsFirst: boolean;
}

export interface FeatureGenerationResponse {
    summary: string;
    existingMethodsToReuse: string[];
    proposedServiceBoundaries: string[];
    proposedFiles: string[];
    implementationSteps: string[];
    testPlan: string[];
    guardrailsApplied: string[];
    generatedAtUtc: string;
}

export interface DocumentationUpdateRequest {
    topic: string;
    changeSummary: string;
    targetDocumentName: string;
    matchExistingDocumentationStyle: boolean;
}

export interface DocumentationUpdateResponse {
    targetDocumentName: string;
    proposedMarkdown: string;
    existingDocumentationSignals: string[];
    namingConventionNotes: string[];
    guardrailsApplied: string[];
    generatedAtUtc: string;
}

export interface AgentChatRequest {
    message: string;
    uploadedFileIds: string[];
    includeCodebaseContext: boolean;
    generateDocumentationProposal: boolean;
    generateFeaturePlan: boolean;
}

export interface AgentChatResponse {
    responseType: string;
    answer: string;
    recommendedActions: string[];
    filesConsidered: string[];
    pipelineStages: string[];
    guardrailsApplied: string[];
    proposedFiles: string[];
    implementationSteps: string[];
    proposedMarkdown?: string | null;
    generatedAtUtc: string;
}

export interface UploadScanResult {
    scanStatus: string;
    isAllowed: boolean;
    requiresReview: boolean;
    findings: string[];
    guardrailsApplied: string[];
    scannedAtUtc: string;
}

export interface AgentUploadedFileResponse {
    fileId: string;
    originalFileName: string;
    storedFileName: string;
    contentType: string;
    fileSizeBytes: number;
    uploadStatus: string;
    pipelineLayer: string;
    scanResult: UploadScanResult;
    pipelineStages: string[];
    uploadedAtUtc: string;
}
