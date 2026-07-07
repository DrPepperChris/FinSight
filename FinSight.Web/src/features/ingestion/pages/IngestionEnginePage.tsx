import React from "react";
import { apiClient } from "../../../lib/apiClient";

import type {
    GoldOutputDefinition,
    GoldOutputType,
    IngestionSourceType,
    PipelinePlan,
    TransformationOption
} from "../types/ingestionTypes";

type ViewMode = "walkthrough" | "planner";

type WalkthroughTab =
    | "overview"
    | "bronze"
    | "silver"
    | "gold"
    | "reporting"
    | "errors"
    | "architecture";

interface PipelineStepResult {
    name: string;
    layer: string;
    status: string;
    inputRows: number;
    outputRows: number;
    description: string;
    transformations: string[];
}

interface BronzeTransactionRow {
    batchId: string;
    rawRowNumber: number;
    sourceFile: string;
    ingestionTimestampUtc: string;
    transactionId: string;
    accountId: string;
    customerId: string;
    accountNumber: string;
    customerName: string;
    transactionType: string;
    amount: string;
    transactionDate: string;
    description: string;
}

interface SilverTransactionRow {
    transactionId: number;
    accountId: number;
    customerId: number;
    accountNumber: string;
    customerName: string;
    transactionType: string;
    transactionTypeNormalized: string;
    cashFlowDirection: string;
    amount: number;
    transactionDate: string;
    description: string;
}

interface RejectedTransactionRow {
    rawRowNumber: number;
    reason: string;
}

interface GoldCustomerAccountSummary {
    customerId: number;
    customerName: string;
    accountId: number;
    accountNumber: string;
    transactionCount: number;
    totalInflowAmount: number;
    totalOutflowAmount: number;
    netCashFlow: number;
    latestTransactionDate: string;
}

interface TransactionTypeSummary {
    transactionType: string;
    cashFlowDirection: string;
    transactionCount: number;
    totalAmount: number;
}

interface DailyTransactionTrend {
    transactionDate: string;
    cashFlowDirection: string;
    transactionCount: number;
    totalAmount: number;
}

interface ReportingSummary {
    highValueTransactions: SilverTransactionRow[];
    transactionVolumeByType: TransactionTypeSummary[];
    dailyTransactionTrend: DailyTransactionTrend[];
}

interface IngestionPipelineResult {
    batchId: string;
    sourceFile: string;
    startedAtUtc: string;
    completedAtUtc: string;
    steps: PipelineStepResult[];
    bronzeRows: BronzeTransactionRow[];
    silverRows: SilverTransactionRow[];
    rejectedRows: RejectedTransactionRow[];
    goldRows: GoldCustomerAccountSummary[];
    reporting: ReportingSummary;
}

interface DatabricksJobValidationResult {
    isValid: boolean;
    status: string;
    messages: string[];
    warnings: string[];
}

interface DatabricksJobRunResult {
    runId: string;
    status: string;
    submittedAtUtc: string;
    message: string;
    plannedSteps: string[];
}

interface DatabricksJobStatusResult {
    runId: string;
    status: string;
    percentComplete: number;
    lastUpdatedUtc: string;
    completedSteps: string[];
    message: string;
}

const transformationOptions: TransformationOption[] = [
    {
        id: "typeCasting",
        label: "Type casting",
        description: "Cast IDs, currency, dates, and flags into analytics-ready types."
    },
    {
        id: "timestampParsing",
        label: "Timestamp parsing",
        description: "Convert source date strings into standard UTC timestamps."
    },
    {
        id: "textNormalization",
        label: "Trim and normalize text",
        description: "Standardize names, status values, categories, and source fields."
    },
    {
        id: "statusNormalization",
        label: "Status normalization",
        description: "Map inconsistent status values into approved reporting categories."
    },
    {
        id: "deduplication",
        label: "Deduplicate records",
        description: "Remove duplicate records using business keys such as transaction ID."
    },
    {
        id: "highValueFlag",
        label: "High-value transaction flag",
        description: "Flag transactions above a configured threshold for review."
    },
    {
        id: "flaggedTransactionDetection",
        label: "Flagged transaction detection",
        description: "Preserve fraud, risk, or compliance indicators from the source."
    },
    {
        id: "customerAccountJoin",
        label: "Join customer/account reference data",
        description: "Create enriched records by joining transactions to customers and accounts."
    },
    {
        id: "customerAggregation",
        label: "Aggregate by customer",
        description: "Summarize balances, activity, and transaction volume by customer."
    },
    {
        id: "portfolioSummary",
        label: "Create portfolio summary",
        description: "Generate portfolio-level metrics for reporting and dashboards."
    }
];

const goldOutputDefinitions: GoldOutputDefinition[] = [
    {
        id: "CustomerAccountSummary",
        name: "Customer Account Summary",
        targetTable: "finsight_gold.customer_account_summary",
        businessPurpose:
            "Summarize customer balances, account counts, deposits, withdrawals, and latest activity.",
        columns: [
            "customer_id",
            "customer_number",
            "full_name",
            "risk_rating",
            "total_accounts",
            "total_balance",
            "total_deposits",
            "total_withdrawals",
            "total_transaction_count",
            "latest_transaction_timestamp"
        ]
    },
    {
        id: "TransactionRiskSummary",
        name: "Transaction Risk Summary",
        targetTable: "finsight_gold.transaction_risk_summary",
        businessPurpose:
            "Identify high-value and flagged transaction behavior for audit and risk review.",
        columns: [
            "customer_id",
            "customer_number",
            "full_name",
            "risk_rating",
            "total_transaction_count",
            "high_value_transaction_count",
            "flagged_transaction_count",
            "total_transaction_volume",
            "risk_signal"
        ]
    },
    {
        id: "PortfolioSummary",
        name: "Portfolio Summary",
        targetTable: "finsight_gold.portfolio_summary",
        businessPurpose:
            "Create executive-level metrics for customers, accounts, loans, balances, and transaction activity.",
        columns: [
            "metric_name",
            "metric_value",
            "metric_description",
            "created_at_utc"
        ]
    },
    {
        id: "LoanApplicationSummary",
        name: "Loan Application Summary",
        targetTable: "finsight_gold.loan_application_summary",
        businessPurpose:
            "Summarize loan application volume, approval status, decision outcomes, and customer risk distribution.",
        columns: [
            "loan_type",
            "status",
            "application_count",
            "total_requested_amount",
            "average_requested_amount",
            "latest_submission_timestamp"
        ]
    }
];

function getGoldOutputDefinition(id: GoldOutputType) {
    return (
        goldOutputDefinitions.find((definition) => definition.id === id) ??
        goldOutputDefinitions[0]
    );
}




export function IngestionEnginePage() {
    const [viewMode, setViewMode] = React.useState<ViewMode>("walkthrough");

    const [sourceType, setSourceType] =
        React.useState<IngestionSourceType>("CloudStorage");

    const [selectedTransformations, setSelectedTransformations] = React.useState<string[]>([
        "typeCasting",
        "timestampParsing",
        "deduplication",
        "statusNormalization",
        "highValueFlag",
        "customerAccountJoin"
    ]);

    const [goldOutputType, setGoldOutputType] =
        React.useState<GoldOutputType>("TransactionRiskSummary");

    const [cloudStorageConfig, setCloudStorageConfig] = React.useState({
        storageAccount: "finsightlakehouse",
        container: "landing",
        landingPath: "/finsight/transactions/",
        fileFormat: "csv",
        schemaMode: "inferAndEvolve",
        targetBronzeTable: "finsight_bronze.transactions_raw",
        checkpointPath: "/checkpoints/finsight/transactions"
    });

    const [databaseConfig, setDatabaseConfig] = React.useState({
        databaseType: "Azure SQL",
        serverName: "finsight-sql-cw-2026.database.windows.net",
        databaseName: "FinSightDb",
        sourceTable: "dbo.BankTransactions",
        ingestionMode: "Incremental",
        incrementalColumn: "CreatedDate",
        targetBronzeTable: "finsight_bronze.transactions_raw"
    });

    const [walkthroughResult, setWalkthroughResult] =
        React.useState<IngestionPipelineResult | null>(null);

    const [walkthroughTab, setWalkthroughTab] =
        React.useState<WalkthroughTab>("overview");

    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [isRunningPipeline, setIsRunningPipeline] = React.useState(false);
    const [pipelineError, setPipelineError] = React.useState<string | null>(null);

    const [databricksValidation, setDatabricksValidation] =
        React.useState<DatabricksJobValidationResult | null>(null);

    const [databricksRun, setDatabricksRun] =
        React.useState<DatabricksJobRunResult | null>(null);

    const [databricksStatus, setDatabricksStatus] =
        React.useState<DatabricksJobStatusResult | null>(null);

    const [isDatabricksActionRunning, setIsDatabricksActionRunning] =
        React.useState(false);

    const [databricksError, setDatabricksError] =
        React.useState<string | null>(null);

    const goldDefinition = getGoldOutputDefinition(goldOutputType);

    function toggleTransformation(id: string) {
        setSelectedTransformations((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    }

    function getBronzeTable() {
        return sourceType === "CloudStorage"
            ? cloudStorageConfig.targetBronzeTable
            : databaseConfig.targetBronzeTable;
    }

    function buildPipelinePlan(): PipelinePlan {
        return {
            sourceType,
            bronzeTable: getBronzeTable(),
            silverTable: "finsight_silver.transactions_clean",
            goldTable: goldDefinition.targetTable,
            transformations: selectedTransformations,
            goldStandard: goldDefinition,
            pipelineSteps: [
                "Define the source system and landing-zone pattern for the ingestion workflow.",
                sourceType === "CloudStorage"
                    ? "Map uploaded or landed files to a Databricks Auto Loader pattern for Bronze ingestion."
                    : "Map operational database data to a secure Databricks connector or Lakeflow-style ingestion pattern.",
                "Preserve raw records in a Bronze Delta table with batch, file, and ingestion metadata.",
                "Apply Silver validation, type casting, timestamp parsing, deduplication, and standardization rules.",
                "Aggregate clean Silver records into the selected Gold business output.",
                "Expose reporting-ready views for dashboards, audit review, and analytics."
            ]
        };
    }

    const pipelinePlan = buildPipelinePlan();

    const generatedConfig =
        sourceType === "CloudStorage"
            ? {
                designPurpose: "Azure Databricks medallion architecture mapping",
                executionMode: "Design preview only",
                liveDemoExecution: "FinSight ASP.NET Core API",
                targetPlatform: "Azure Databricks",
                targetArchitecture: "Bronze / Silver / Gold / Reporting",
                source: {
                    sourceType,
                    storageAccount: cloudStorageConfig.storageAccount,
                    container: cloudStorageConfig.container,
                    landingPath: cloudStorageConfig.landingPath,
                    fileFormat: cloudStorageConfig.fileFormat,
                    schemaMode: cloudStorageConfig.schemaMode
                },
                bronze: {
                    table: cloudStorageConfig.targetBronzeTable,
                    ingestionPattern: "Databricks Auto Loader",
                    checkpointPath: cloudStorageConfig.checkpointPath,
                    purpose: "Preserve raw source records with ingestion metadata"
                },
                silver: {
                    table: pipelinePlan.silverTable,
                    transformations: selectedTransformations,
                    purpose: "Validate, type, normalize, deduplicate, and classify records"
                },
                gold: {
                    table: pipelinePlan.goldTable,
                    name: goldDefinition.name,
                    businessPurpose: goldDefinition.businessPurpose,
                    columns: goldDefinition.columns
                },
                reporting: {
                    outputs: [
                        "High-value transaction review",
                        "Transaction volume by type",
                        "Daily cash-flow trend",
                        "Customer/account summary"
                    ]
                },
                security: {
                    browserStoresSecrets: false,
                    secretHandling: "Backend-managed Databricks secret scope",
                    note: "This UI does not collect or persist cloud credentials."
                }
            }
            : {
                designPurpose: "Azure Databricks medallion architecture mapping",
                executionMode: "Design preview only",
                liveDemoExecution: "FinSight ASP.NET Core API",
                targetPlatform: "Azure Databricks",
                targetArchitecture: "Bronze / Silver / Gold / Reporting",
                source: {
                    sourceType,
                    databaseType: databaseConfig.databaseType,
                    serverName: databaseConfig.serverName,
                    databaseName: databaseConfig.databaseName,
                    sourceTable: databaseConfig.sourceTable,
                    ingestionMode: databaseConfig.ingestionMode,
                    incrementalColumn: databaseConfig.incrementalColumn
                },
                bronze: {
                    table: databaseConfig.targetBronzeTable,
                    ingestionPattern: "Secure database connector or Lakeflow-style ingestion",
                    purpose: "Preserve raw operational records with ingestion metadata"
                },
                silver: {
                    table: pipelinePlan.silverTable,
                    transformations: selectedTransformations,
                    purpose: "Validate, type, normalize, deduplicate, and classify records"
                },
                gold: {
                    table: pipelinePlan.goldTable,
                    name: goldDefinition.name,
                    businessPurpose: goldDefinition.businessPurpose,
                    columns: goldDefinition.columns
                },
                reporting: {
                    outputs: [
                        "High-value transaction review",
                        "Transaction volume by type",
                        "Daily cash-flow trend",
                        "Customer/account summary"
                    ]
                },
                security: {
                    browserStoresSecrets: false,
                    secretReference: "{{DATABRICKS_SECRET_SCOPE}}/{{AZURE_SQL_CONNECTION_KEY}}",
                    note: "Credentials would be resolved by the backend, not entered in the browser."
                }
            };


    function buildDatabricksJobRequest() {
        return {
            sourceType,
            bronzeTable: pipelinePlan.bronzeTable,
            silverTable: pipelinePlan.silverTable,
            goldTable: pipelinePlan.goldTable,
            transformations: selectedTransformations,
            goldOutputName: goldDefinition.name
        };
    }

    async function validateDatabricksDesign() {
        setIsDatabricksActionRunning(true);
        setDatabricksError(null);

        try {
            const response = await apiClient.post<DatabricksJobValidationResult>(
                "/api/Databricks/jobs/validate",
                buildDatabricksJobRequest()
            );

            setDatabricksValidation(response.data);
        } catch (error: any) {
            console.error("Databricks validation error:", error);

            const status = error?.response?.status;

            if (status === 401) {
                setDatabricksError("Databricks validation failed with 401 Unauthorized. Log out and log back in.");
            } else if (status === 403) {
                setDatabricksError("Databricks validation failed with 403 Forbidden. Admin or Analyst role is required.");
            } else {
                setDatabricksError("Unable to validate Databricks design.");
            }
        } finally {
            setIsDatabricksActionRunning(false);
        }
    }

    async function simulateDatabricksJob() {
        setIsDatabricksActionRunning(true);
        setDatabricksError(null);
        setDatabricksStatus(null);

        try {
            const response = await apiClient.post<DatabricksJobRunResult>(
                "/api/Databricks/jobs/run",
                buildDatabricksJobRequest()
            );

            setDatabricksRun(response.data);
        } catch (error: any) {
            console.error("Databricks run error:", error);

            const status = error?.response?.status;

            if (status === 401) {
                setDatabricksError("Databricks simulation failed with 401 Unauthorized. Log out and log back in.");
            } else if (status === 403) {
                setDatabricksError("Databricks simulation failed with 403 Forbidden. Admin or Analyst role is required.");
            } else {
                setDatabricksError("Unable to simulate Databricks job.");
            }
        } finally {
            setIsDatabricksActionRunning(false);
        }
    }

    async function checkDatabricksJobStatus() {
        if (!databricksRun?.runId) {
            setDatabricksError("Run a simulated Databricks job before checking status.");
            return;
        }

        setIsDatabricksActionRunning(true);
        setDatabricksError(null);

        try {
            const response = await apiClient.get<DatabricksJobStatusResult>(
                `/api/Databricks/jobs/status/${databricksRun.runId}`
            );

            setDatabricksStatus(response.data);
        } catch (error: any) {
            console.error("Databricks status error:", error);

            const status = error?.response?.status;

            if (status === 401) {
                setDatabricksError("Databricks status check failed with 401 Unauthorized. Log out and log back in.");
            } else if (status === 403) {
                setDatabricksError("Databricks status check failed with 403 Forbidden. Admin or Analyst role is required.");
            } else {
                setDatabricksError("Unable to check Databricks job status.");
            }
        } finally {
            setIsDatabricksActionRunning(false);
        }
    }

    async function runSamplePipeline() {
        setIsRunningPipeline(true);
        setPipelineError(null);

        try {
            const response = await apiClient.post<IngestionPipelineResult>(
                "/api/DataIngestion/sample"
            );

            setWalkthroughResult(response.data);
            setWalkthroughTab("overview");
        } catch (error: any) {
            console.error("Sample pipeline error:", error);

            const status = error?.response?.status;
            const apiMessage = error?.response?.data?.message;

            if (status === 401) {
                setPipelineError("Sample pipeline failed with 401 Unauthorized. Log out and log back in.");
            } else if (status === 403) {
                setPipelineError("Sample pipeline failed with 403 Forbidden. Your role cannot run this.");
            } else {
                setPipelineError(apiMessage ?? "Unable to run sample ingestion pipeline.");
            }
        } finally {
            setIsRunningPipeline(false);
        }
    }

    async function uploadCsvPipeline() {
        if (!selectedFile) {
            setPipelineError("Choose a CSV file before processing.");
            return;
        }

        setIsRunningPipeline(true);
        setPipelineError(null);
        setWalkthroughResult(null);
        setWalkthroughTab("overview");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile, selectedFile.name);

            const response = await apiClient.post<IngestionPipelineResult>(
                "/api/DataIngestion/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setWalkthroughResult(response.data);
            setWalkthroughTab("overview");
        } catch (error: any) {
            console.error("Upload pipeline error:", error);

            const status = error?.response?.status;
            const responseData = error?.response?.data;

            let apiMessage = "Unable to process uploaded CSV.";

            if (typeof responseData === "string") {
                apiMessage = responseData;
            } else if (responseData?.message) {
                apiMessage = responseData.message;
            } else if (responseData?.title) {
                apiMessage = responseData.title;
            }

            if (status === 400) {
                setPipelineError(`CSV upload failed with 400 Bad Request. ${apiMessage}`);
            } else if (status === 401) {
                setPipelineError("CSV upload failed with 401 Unauthorized. Log out and log back in.");
            } else if (status === 403) {
                setPipelineError("CSV upload failed with 403 Forbidden. Upload requires Admin or Analyst.");
            } else if (status) {
                setPipelineError(`CSV upload failed with status ${status}. ${apiMessage}`);
            } else {
                setPipelineError(apiMessage);
            }
        } finally {
            setIsRunningPipeline(false);
        }
    }

    function resetWalkthrough() {
        setWalkthroughResult(null);
        setWalkthroughTab("overview");
        setSelectedFile(null);
        setPipelineError(null);
    }

    return (
        <main className="page">
            <div className="page-header">
                <h1>Ingestion Engine</h1>
                <p>
                    Demonstrate how FinSight moves operational banking data through Bronze,
                    Silver, Gold, and Reporting layers.
                </p>
            </div>

            <div className="ingestion-mode-switch">
                <button
                    type="button"
                    className={viewMode === "walkthrough" ? "active" : ""}
                    onClick={() => setViewMode("walkthrough")}
                >
                    Run ETL Walkthrough
                </button>

                <button
                    type="button"
                    className={viewMode === "planner" ? "active" : ""}
                    onClick={() => setViewMode("planner")}
                >
                    View Databricks Design
                </button>
            </div>

            {viewMode === "walkthrough" ? (
                <section className="etl-walkthrough">
                    <section className="ingestion-warning-card">
                        <h2>Interactive demo mode</h2>
                        <p>
                            This walkthrough calls the FinSight API and runs a sample or uploaded CSV
                            through a medallion-style ETL flow. The Databricks design view shows how
                            the same workflow maps to Azure Databricks, Delta tables, and lakehouse
                            reporting patterns.
                        </p>
                    </section>

                    <section className="table-card">
                        <h2>1. Start Pipeline</h2>

                        <div className="walkthrough-actions">
                            <button
                                type="button"
                                onClick={runSamplePipeline}
                                disabled={isRunningPipeline}
                            >
                                {isRunningPipeline ? "Running..." : "Run Built-In Sample"}
                            </button>

                            <label className="file-upload-button">
                                Choose CSV
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(event) => {
                                        setSelectedFile(event.target.files?.[0] ?? null);
                                        setWalkthroughResult(null);
                                        setWalkthroughTab("overview");
                                        setPipelineError(null);
                                    }}
                                />
                            </label>

                            <button
                                type="button"
                                onClick={uploadCsvPipeline}
                                disabled={isRunningPipeline || !selectedFile}
                            >
                                Process Uploaded CSV
                            </button>

                            <button
                                type="button"
                                className="secondary-action"
                                onClick={resetWalkthrough}
                            >
                                Reset
                            </button>
                        </div>

                        {selectedFile && (
                            <p className="selected-file">
                                Selected upload file: <strong>{selectedFile.name}</strong>
                                <br />
                                <small>Use Process Uploaded CSV to run this file. Run Built-In Sample ignores selected files.</small>
                            </p>
                        )}

                        {pipelineError && <div className="pipeline-error">{pipelineError}</div>}

                        {!walkthroughResult && (
                            <div className="empty-walkthrough">
                                <h3>Expected CSV schema</h3>
                                <pre className="json-preview">
                                    transaction_id,account_id,customer_id,account_number,customer_name,transaction_type,amount,transaction_date,description
                                </pre>
                                <p>
                                    Start with the sample pipeline first. It should return Bronze rows,
                                    Silver rows, Gold summaries, reporting outputs, and rejected rows if
                                    validation fails.
                                </p>
                            </div>
                        )}
                    </section>

                    {walkthroughResult && (
                        <>
                            <section className="ingestion-grid">
                                {walkthroughResult.steps.map((step, index) => (
                                    <div className="table-card pipeline-stage-card" key={step.name}>
                                        <div className="stage-number">{index + 1}</div>
                                        <h2>{step.layer}</h2>
                                        <h3>{step.name}</h3>
                                        <p>{step.description}</p>
                                        <div className="stage-metrics">
                                            <span>Input: {step.inputRows}</span>
                                            <span>Output: {step.outputRows}</span>
                                            <span>Status: {step.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </section>

                            <div className="walkthrough-tab-list">
                                {[
                                    ["overview", "Overview"],
                                    ["bronze", "Bronze"],
                                    ["silver", "Silver"],
                                    ["gold", "Gold"],
                                    ["reporting", "Reporting"],
                                    ["errors", "Errors"],
                                    ["architecture", "Architecture"]
                                ].map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={walkthroughTab === key ? "active" : ""}
                                        onClick={() => setWalkthroughTab(key as WalkthroughTab)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {walkthroughTab === "overview" && (
                                <section className="table-card">
                                    <h2>Pipeline Summary</h2>

                                    <div className="metric-grid">
                                        <MetricCard
                                            label="Source File"
                                            value={walkthroughResult.sourceFile}
                                        />
                                        <MetricCard
                                            label="Bronze Rows"
                                            value={walkthroughResult.bronzeRows.length.toString()}
                                        />
                                        <MetricCard
                                            label="Silver Rows"
                                            value={walkthroughResult.silverRows.length.toString()}
                                        />
                                        <MetricCard
                                            label="Rejected Rows"
                                            value={walkthroughResult.rejectedRows.length.toString()}
                                        />
                                        <MetricCard
                                            label="Gold Summaries"
                                            value={walkthroughResult.goldRows.length.toString()}
                                        />
                                        <MetricCard
                                            label="High-Value Transactions"
                                            value={walkthroughResult.reporting.highValueTransactions.length.toString()}
                                        />
                                    </div>

                                    <h3>Transformation Summary</h3>
                                    <ol className="pipeline-step-list">
                                        {walkthroughResult.steps.flatMap((step) =>
                                            step.transformations.map((transformation) => (
                                                <li key={`${step.name}-${transformation}`}>
                                                    <strong>{step.layer}:</strong> {transformation}
                                                </li>
                                            ))
                                        )}
                                    </ol>
                                </section>
                            )}

                            {walkthroughTab === "bronze" && (
                                <section className="table-card">
                                    <h2>Bronze Layer: Raw Ingestion</h2>
                                    <p>
                                        Bronze keeps the raw source values and adds metadata such as
                                        batch ID, source file, timestamp, and row number.
                                    </p>

                                    <ResponsiveTable>
                                        <thead>
                                            <tr>
                                                <th>Row</th>
                                                <th>Transaction ID</th>
                                                <th>Customer</th>
                                                <th>Account</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Date</th>
                                                <th>Source</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {walkthroughResult.bronzeRows.map((row) => (
                                                <tr key={row.rawRowNumber}>
                                                    <td>{row.rawRowNumber}</td>
                                                    <td>{row.transactionId}</td>
                                                    <td>{row.customerName}</td>
                                                    <td>{row.accountNumber}</td>
                                                    <td>{row.transactionType}</td>
                                                    <td>{row.amount}</td>
                                                    <td>{formatDate(row.transactionDate)}</td>
                                                    <td>{row.sourceFile}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </ResponsiveTable>
                                </section>
                            )}

                            {walkthroughTab === "silver" && (
                                <section className="table-card">
                                    <h2>Silver Layer: Cleaned Transactions</h2>
                                    <p>
                                        Silver parses, validates, standardizes, and classifies the raw
                                        transaction records.
                                    </p>

                                    <ResponsiveTable>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Customer</th>
                                                <th>Account</th>
                                                <th>Normalized Type</th>
                                                <th>Direction</th>
                                                <th>Amount</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {walkthroughResult.silverRows.map((row) => (
                                                <tr key={row.transactionId}>
                                                    <td>{row.transactionId}</td>
                                                    <td>{row.customerName}</td>
                                                    <td>{row.accountNumber}</td>
                                                    <td>{row.transactionTypeNormalized}</td>
                                                    <td>{row.cashFlowDirection}</td>
                                                    <td>{formatCurrency(row.amount)}</td>
                                                    <td>{formatDate(row.transactionDate)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </ResponsiveTable>
                                </section>
                            )}

                            {walkthroughTab === "gold" && (
                                <section className="table-card">
                                    <h2>Gold Layer: Customer Account Summary</h2>
                                    <p>
                                        Gold aggregates clean Silver records into business-ready customer
                                        and account analytics.
                                    </p>

                                    <ResponsiveTable>
                                        <thead>
                                            <tr>
                                                <th>Customer</th>
                                                <th>Account</th>
                                                <th>Transactions</th>
                                                <th>Inflow</th>
                                                <th>Outflow</th>
                                                <th>Net Cash Flow</th>
                                                <th>Latest Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {walkthroughResult.goldRows.map((row) => (
                                                <tr key={`${row.customerId}-${row.accountId}`}>
                                                    <td>{row.customerName}</td>
                                                    <td>{row.accountNumber}</td>
                                                    <td>{row.transactionCount}</td>
                                                    <td>{formatCurrency(row.totalInflowAmount)}</td>
                                                    <td>{formatCurrency(row.totalOutflowAmount)}</td>
                                                    <td>{formatCurrency(row.netCashFlow)}</td>
                                                    <td>{formatDate(row.latestTransactionDate)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </ResponsiveTable>
                                </section>
                            )}

                            {walkthroughTab === "reporting" && (
                                <section className="table-card">
                                    <h2>Reporting Views</h2>

                                    <h3>High-Value Transactions</h3>
                                    <ResponsiveTable>
                                        <thead>
                                            <tr>
                                                <th>Customer</th>
                                                <th>Account</th>
                                                <th>Type</th>
                                                <th>Direction</th>
                                                <th>Amount</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {walkthroughResult.reporting.highValueTransactions.map((row) => (
                                                <tr key={row.transactionId}>
                                                    <td>{row.customerName}</td>
                                                    <td>{row.accountNumber}</td>
                                                    <td>{row.transactionTypeNormalized}</td>
                                                    <td>{row.cashFlowDirection}</td>
                                                    <td>{formatCurrency(row.amount)}</td>
                                                    <td>{formatDate(row.transactionDate)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </ResponsiveTable>

                                    <h3>Transaction Volume by Type</h3>
                                    <div className="metric-grid">
                                        {walkthroughResult.reporting.transactionVolumeByType.map((item) => (
                                            <MetricCard
                                                key={`${item.transactionType}-${item.cashFlowDirection}`}
                                                label={`${item.transactionType} Â· ${item.cashFlowDirection}`}
                                                value={`${item.transactionCount} / ${formatCurrency(item.totalAmount)}`}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {walkthroughTab === "errors" && (
                                <section className="table-card">
                                    <h2>Rejected Rows</h2>

                                    {walkthroughResult.rejectedRows.length === 0 ? (
                                        <p>No rejected rows. All records passed validation.</p>
                                    ) : (
                                        <ResponsiveTable>
                                            <thead>
                                                <tr>
                                                    <th>Raw Row</th>
                                                    <th>Reason</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {walkthroughResult.rejectedRows.map((row) => (
                                                    <tr key={row.rawRowNumber}>
                                                        <td>{row.rawRowNumber}</td>
                                                        <td>{row.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </ResponsiveTable>
                                    )}
                                </section>
                            )}

                            {walkthroughTab === "architecture" && (
                                <section className="table-card">
                                    <h2>Architecture</h2>
                                    <div className="architecture-flow">
                                        <span>CSV Source</span>
                                        <strong>â†’</strong>
                                        <span>Bronze Raw</span>
                                        <strong>â†’</strong>
                                        <span>Silver Clean</span>
                                        <strong>â†’</strong>
                                        <span>Gold Summary</span>
                                        <strong>â†’</strong>
                                        <span>Reporting Views</span>
                                    </div>
                                    <p>
                                        The live walkthrough runs through the FinSight API for a stable portfolio
                                        demo. The Databricks design view documents how the same workflow could be
                                        implemented with Azure Databricks, Delta tables, Lakeflow-style ingestion,
                                        backend-managed secrets, and reporting-ready Gold views.
                                    </p>
                                </section>
                            )}
                        </>
                    )}
                </section>
            ) : (
                <>
                    <section className="ingestion-warning-card">
                        <h2>Databricks architecture design</h2>
                        <p>
                            This view shows how the FinSight ingestion workflow maps to an Azure
                            Databricks medallion architecture. The live demo runs through the FinSight
                            API, while this design view documents the target Bronze, Silver, Gold,
                            and reporting configuration that could be implemented with Databricks Jobs,
                            Lakeflow, Delta tables, and secure backend-managed secrets.
                        </p>
                    </section>

                    <section className="ingestion-grid">
                        <div className="table-card">
                            <h2>1. Source Type</h2>

                            <div className="radio-stack">
                                <label>
                                    <input
                                        type="radio"
                                        name="sourceType"
                                        checked={sourceType === "CloudStorage"}
                                        onChange={() => setSourceType("CloudStorage")}
                                    />
                                    Cloud Storage Landing Zone
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="sourceType"
                                        checked={sourceType === "DatabaseConnector"}
                                        onChange={() => setSourceType("DatabaseConnector")}
                                    />
                                    Database Connector
                                </label>
                            </div>

                            {sourceType === "CloudStorage" ? (
                                <div className="form-grid">
                                    <label>
                                        Storage Account
                                        <input
                                            value={cloudStorageConfig.storageAccount}
                                            onChange={(event) =>
                                                setCloudStorageConfig({
                                                    ...cloudStorageConfig,
                                                    storageAccount: event.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Container
                                        <input
                                            value={cloudStorageConfig.container}
                                            onChange={(event) =>
                                                setCloudStorageConfig({
                                                    ...cloudStorageConfig,
                                                    container: event.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Landing Path
                                        <input
                                            value={cloudStorageConfig.landingPath}
                                            onChange={(event) =>
                                                setCloudStorageConfig({
                                                    ...cloudStorageConfig,
                                                    landingPath: event.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        File Format
                                        <select
                                            value={cloudStorageConfig.fileFormat}
                                            onChange={(event) =>
                                                setCloudStorageConfig({
                                                    ...cloudStorageConfig,
                                                    fileFormat: event.target.value
                                                })
                                            }
                                        >
                                            <option value="csv">CSV</option>
                                            <option value="json">JSON</option>
                                            <option value="parquet">Parquet</option>
                                        </select>
                                    </label>

                                    <label>
                                        Schema Mode
                                        <input
                                            value={cloudStorageConfig.schemaMode}
                                            onChange={(event) =>
                                                setCloudStorageConfig({
                                                    ...cloudStorageConfig,
                                                    schemaMode: event.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Checkpoint Path
                                        <input
                                            value={cloudStorageConfig.checkpointPath}
                                            onChange={(event) =>
                                                setCloudStorageConfig({
                                                    ...cloudStorageConfig,
                                                    checkpointPath: event.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label className="wide-field">
                                        Target Bronze Table
                                        <input
                                            value={cloudStorageConfig.targetBronzeTable}
                                            onChange={(event) =>
                                                setCloudStorageConfig({
                                                    ...cloudStorageConfig,
                                                    targetBronzeTable: event.target.value
                                                })
                                            }
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="form-grid">
                                    <label>
                                        Database Type
                                        <select
                                            value={databaseConfig.databaseType}
                                            onChange={(event) =>
                                                setDatabaseConfig({
                                                    ...databaseConfig,
                                                    databaseType: event.target.value
                                                })
                                            }
                                        >
                                            <option value="Azure SQL">Azure SQL</option>
                                            <option value="SQL Server">SQL Server</option>
                                            <option value="PostgreSQL">PostgreSQL</option>
                                        </select>
                                    </label>

                                    <label>
                                        Server Name
                                        <input
                                            value={databaseConfig.serverName}
                                            onChange={(event) =>
                                                setDatabaseConfig({
                                                    ...databaseConfig,
                                                    serverName: event.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Database Name
                                        <input
                                            value={databaseConfig.databaseName}
                                            onChange={(event) =>
                                                setDatabaseConfig({
                                                    ...databaseConfig,
                                                    databaseName: event.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Source Table
                                        <input
                                            value={databaseConfig.sourceTable}
                                            onChange={(event) =>
                                                setDatabaseConfig({
                                                    ...databaseConfig,
                                                    sourceTable: event.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Ingestion Mode
                                        <select
                                            value={databaseConfig.ingestionMode}
                                            onChange={(event) =>
                                                setDatabaseConfig({
                                                    ...databaseConfig,
                                                    ingestionMode: event.target.value
                                                })
                                            }
                                        >
                                            <option value="Full Refresh">Full Refresh</option>
                                            <option value="Incremental">Incremental</option>
                                            <option value="CDC">CDC</option>
                                        </select>
                                    </label>

                                    <label>
                                        Incremental Column
                                        <input
                                            value={databaseConfig.incrementalColumn}
                                            onChange={(event) =>
                                                setDatabaseConfig({
                                                    ...databaseConfig,
                                                    incrementalColumn: event.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label className="wide-field">
                                        Target Bronze Table
                                        <input
                                            value={databaseConfig.targetBronzeTable}
                                            onChange={(event) =>
                                                setDatabaseConfig({
                                                    ...databaseConfig,
                                                    targetBronzeTable: event.target.value
                                                })
                                            }
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="table-card">
                            <h2>2. Transformations</h2>

                            <div className="checkbox-list">
                                {transformationOptions.map((option) => (
                                    <label key={option.id} className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={selectedTransformations.includes(option.id)}
                                            onChange={() => toggleTransformation(option.id)}
                                        />
                                        <span>
                                            <strong>{option.label}</strong>
                                            <small>{option.description}</small>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="table-card">
                        <h2>3. Gold Standard Target</h2>

                        <div className="form-grid">
                            <label className="wide-field">
                                Desired Gold Output
                                <select
                                    value={goldOutputType}
                                    onChange={(event) =>
                                        setGoldOutputType(event.target.value as GoldOutputType)
                                    }
                                >
                                    {goldOutputDefinitions.map((definition) => (
                                        <option value={definition.id} key={definition.id}>
                                            {definition.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="gold-output-card">
                            <div>
                                <h3>{goldDefinition.name}</h3>
                                <p>{goldDefinition.businessPurpose}</p>
                                <p>
                                    <strong>Target table:</strong> {goldDefinition.targetTable}
                                </p>
                            </div>

                            <div>
                                <h3>Gold columns</h3>
                                <div className="tag-list">
                                    {goldDefinition.columns.map((column) => (
                                        <span key={column}>{column}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="table-card">
                        <h2>4. Databricks Job Simulation</h2>
                        <p>
                            Validate the design, simulate a Databricks job submission, and check the
                            simulated run status. This does not call an external Databricks workspace.
                        </p>

                        <div className="walkthrough-actions">
                            <button
                                type="button"
                                onClick={validateDatabricksDesign}
                                disabled={isDatabricksActionRunning}
                            >
                                Validate Design
                            </button>

                            <button
                                type="button"
                                onClick={simulateDatabricksJob}
                                disabled={isDatabricksActionRunning}
                            >
                                Simulate Databricks Job
                            </button>

                            <button
                                type="button"
                                onClick={checkDatabricksJobStatus}
                                disabled={isDatabricksActionRunning || !databricksRun}
                            >
                                Check Run Status
                            </button>
                        </div>

                        {databricksError && (
                            <div className="pipeline-error">{databricksError}</div>
                        )}

                        {databricksValidation && (
                            <div className="gold-output-card">
                                <div>
                                    <h3>Validation: {databricksValidation.status}</h3>
                                    <p>
                                        <strong>Valid:</strong>{" "}
                                        {databricksValidation.isValid ? "Yes" : "No"}
                                    </p>
                                    <ul>
                                        {databricksValidation.messages.map((message) => (
                                            <li key={message}>{message}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3>Warnings</h3>
                                    {databricksValidation.warnings.length === 0 ? (
                                        <p>No warnings.</p>
                                    ) : (
                                        <ul>
                                            {databricksValidation.warnings.map((warning) => (
                                                <li key={warning}>{warning}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}

                        {databricksRun && (
                            <div className="gold-output-card">
                                <div>
                                    <h3>Simulated Run</h3>
                                    <p>
                                        <strong>Run ID:</strong> {databricksRun.runId}
                                    </p>
                                    <p>
                                        <strong>Status:</strong> {databricksRun.status}
                                    </p>
                                    <p>{databricksRun.message}</p>
                                </div>

                                <div>
                                    <h3>Planned Steps</h3>
                                    <ol>
                                        {databricksRun.plannedSteps.map((step) => (
                                            <li key={step}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        )}

                        {databricksStatus && (
                            <div className="gold-output-card">
                                <div>
                                    <h3>Run Status: {databricksStatus.status}</h3>
                                    <p>
                                        <strong>Percent Complete:</strong>{" "}
                                        {databricksStatus.percentComplete}%
                                    </p>
                                    <p>{databricksStatus.message}</p>
                                </div>

                                <div>
                                    <h3>Completed Steps</h3>
                                    <ol>
                                        {databricksStatus.completedSteps.map((step) => (
                                            <li key={step}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="ingestion-grid">
                        <div className="table-card">
                            <h2>5. Generated Pipeline Steps</h2>

                            <ol className="pipeline-step-list">
                                {pipelinePlan.pipelineSteps.map((step) => (
                                    <li key={step}>{step}</li>
                                ))}
                            </ol>
                        </div>

                        <div className="table-card">
                            <h2>Target Databricks Design Config</h2>

                            <pre className="json-preview">
                                {JSON.stringify(generatedConfig, null, 2)}
                            </pre>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

function MetricCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="metric-card">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

function ResponsiveTable({ children }: { children: React.ReactNode }) {
    return (
        <div className="responsive-table">
            <table>{children}</table>
        </div>
    );
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(value);
}

function formatDate(value: string) {
    if (!value) {
        return "";
    }

    return value.split("T")[0];
}
