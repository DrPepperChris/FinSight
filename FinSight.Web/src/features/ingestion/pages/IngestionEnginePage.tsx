import React from "react";
import type {
    GoldOutputDefinition,
    GoldOutputType,
    IngestionSourceType,
    PipelinePlan,
    TransformationOption
} from "../types/ingestionTypes";

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
    return goldOutputDefinitions.find((definition) => definition.id === id) ?? goldOutputDefinitions[0];
}

export function IngestionEnginePage() {
    const [sourceType, setSourceType] = React.useState<IngestionSourceType>("CloudStorage");
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
                "Validate ingestion configuration without storing secrets in the browser.",
                sourceType === "CloudStorage"
                    ? "Ingest new files from the cloud storage landing zone using Databricks Auto Loader."
                    : "Read operational data from the configured database connector or Lakeflow-style pipeline.",
                "Write raw records into the Bronze Delta table.",
                "Apply selected Silver transformations and quality rules.",
                "Build the selected Gold output table.",
                "Create or refresh reporting views for dashboard and BI consumption."
            ]
        };
    }

    const pipelinePlan = buildPipelinePlan();

    const generatedConfig =
        sourceType === "CloudStorage"
            ? {
                sourceType,
                storageAccount: cloudStorageConfig.storageAccount,
                container: cloudStorageConfig.container,
                landingPath: cloudStorageConfig.landingPath,
                fileFormat: cloudStorageConfig.fileFormat,
                schemaMode: cloudStorageConfig.schemaMode,
                bronzeTable: cloudStorageConfig.targetBronzeTable,
                checkpointPath: cloudStorageConfig.checkpointPath,
                silverTable: pipelinePlan.silverTable,
                goldTable: pipelinePlan.goldTable,
                transformations: selectedTransformations,
                goldStandard: {
                    name: goldDefinition.name,
                    targetTable: goldDefinition.targetTable,
                    businessPurpose: goldDefinition.businessPurpose
                }
            }
            : {
                sourceType,
                databaseType: databaseConfig.databaseType,
                serverName: databaseConfig.serverName,
                databaseName: databaseConfig.databaseName,
                sourceTable: databaseConfig.sourceTable,
                ingestionMode: databaseConfig.ingestionMode,
                incrementalColumn: databaseConfig.incrementalColumn,
                bronzeTable: databaseConfig.targetBronzeTable,
                silverTable: pipelinePlan.silverTable,
                goldTable: pipelinePlan.goldTable,
                transformations: selectedTransformations,
                goldStandard: {
                    name: goldDefinition.name,
                    targetTable: goldDefinition.targetTable,
                    businessPurpose: goldDefinition.businessPurpose
                },
                secretReference: "{{DATABRICKS_SECRET_SCOPE}}/{{AZURE_SQL_CONNECTION_KEY}}"
            };

    return (
        <main className="page">
            <div className="page-header">
                <h1>Ingestion Engine</h1>
                <p>
                    Design a Databricks-style ingestion and transformation plan for moving
                    FinSight operational data into Bronze, Silver, Gold, and Reporting layers.
                </p>
            </div>

            <section className="ingestion-warning-card">
                <h2>Secure design note</h2>
                <p>
                    This page generates a Databricks-style pipeline plan. In a production
                    environment, this configuration would be submitted to a backend service
                    that validates credentials, triggers Databricks Jobs or Lakeflow pipelines,
                    and tracks run status. Secrets are not entered or stored in the browser.
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

            <section className="ingestion-grid">
                <div className="table-card">
                    <h2>4. Generated Pipeline Steps</h2>
                    <ol className="pipeline-step-list">
                        {pipelinePlan.pipelineSteps.map((step) => (
                            <li key={step}>{step}</li>
                        ))}
                    </ol>
                </div>

                <div className="table-card">
                    <h2>Generated Databricks Job Config</h2>
                    <pre className="json-preview">
                        {JSON.stringify(generatedConfig, null, 2)}
                    </pre>
                </div>
            </section>
        </main>
    );
}