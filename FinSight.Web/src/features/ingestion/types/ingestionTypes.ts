export type IngestionSourceType = "CloudStorage" | "DatabaseConnector";

export type GoldOutputType =
    | "CustomerAccountSummary"
    | "TransactionRiskSummary"
    | "PortfolioSummary"
    | "LoanApplicationSummary";

export interface TransformationOption {
    id: string;
    label: string;
    description: string;
}

export interface GoldOutputDefinition {
    id: GoldOutputType;
    name: string;
    targetTable: string;
    businessPurpose: string;
    columns: string[];
}

export interface PipelinePlan {
    sourceType: IngestionSourceType;
    bronzeTable: string;
    silverTable: string;
    goldTable: string;
    transformations: string[];
    goldStandard: GoldOutputDefinition;
    pipelineSteps: string[];
}