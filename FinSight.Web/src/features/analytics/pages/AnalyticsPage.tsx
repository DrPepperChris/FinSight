import type { AnalyticsMetric, PipelineStage } from "../types/analyticsTypes";

const pipelineStages: PipelineStage[] = [
    {
        name: "Bronze",
        layer: "Raw Landing Layer",
        source: "Azure SQL exports, CSV files, operational transaction data",
        output: "Raw Delta tables",
        purpose: "Preserve source data with minimal transformation for traceability."
    },
    {
        name: "Silver",
        layer: "Cleaned Data Layer",
        source: "Bronze transaction, customer, account, and loan data",
        output: "Typed, cleaned, standardized Delta tables",
        purpose: "Create reliable analytics-ready records with consistent field names and data types."
    },
    {
        name: "Gold",
        layer: "Business Analytics Layer",
        source: "Silver clean tables",
        output: "Customer account summaries, transaction risk summaries, portfolio metrics",
        purpose: "Aggregate operational data into business-friendly reporting datasets."
    },
    {
        name: "Reporting",
        layer: "Consumption Layer",
        source: "Gold analytics tables",
        output: "SQL views, sample extracts, BI-ready datasets",
        purpose: "Support dashboards, audit review, portfolio analysis, and future fraud/risk reporting."
    }
];

const analyticsMetrics: AnalyticsMetric[] = [
    {
        label: "Bronze Tables",
        value: "4",
        description: "Raw customers, accounts, transactions, and loan applications."
    },
    {
        label: "Silver Tables",
        value: "4",
        description: "Cleaned and standardized banking records."
    },
    {
        label: "Gold Outputs",
        value: "3",
        description: "Customer summary, transaction risk, and portfolio reporting datasets."
    },
    {
        label: "Reporting Views",
        value: "3",
        description: "SQL views designed for dashboards and BI tools."
    }
];

export function AnalyticsPage() {
    return (
        <main className="page">
            <div className="page-header">
                <h1>Databricks Analytics</h1>
                <p>
                    FinSight demonstrates how operational banking data can flow into a
                    Databricks-style lakehouse pipeline for ETL, analytics, and reporting.
                </p>
            </div>

            <section className="analytics-hero-card">
                <div>
                    <h2>Medallion Architecture</h2>
                    <p>
                        The FinSight analytics workflow models a Bronze, Silver, Gold, and
                        Reporting pipeline. Operational data from customers, accounts,
                        transactions, loans, and audit activity can be extracted from Azure SQL
                        and transformed into business-ready datasets.
                    </p>
                </div>

                <div className="analytics-flow">
                    <span>Azure SQL</span>
                    <span>Bronze</span>
                    <span>Silver</span>
                    <span>Gold</span>
                    <span>Reporting</span>
                </div>
            </section>

            <section className="metric-grid">
                {analyticsMetrics.map((metric) => (
                    <article className="metric-card" key={metric.label}>
                        <h2>{metric.value}</h2>
                        <p className="metric-label">{metric.label}</p>
                        <p>{metric.description}</p>
                    </article>
                ))}
            </section>

            <section className="table-card">
                <h2>ETL Pipeline Stages</h2>
                <p>
                    These stages map directly to the notebooks and SQL scripts in the
                    repository&apos;s Databricks folder.
                </p>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Stage</th>
                            <th>Layer</th>
                            <th>Source</th>
                            <th>Output</th>
                            <th>Purpose</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pipelineStages.map((stage) => (
                            <tr key={stage.name}>
                                <td>{stage.name}</td>
                                <td>{stage.layer}</td>
                                <td>{stage.source}</td>
                                <td>{stage.output}</td>
                                <td>{stage.purpose}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="table-card">
                <h2>Repository Assets</h2>
                <p>
                    The Databricks showcase is implemented as notebook-ready assets in source
                    control so reviewers can inspect the ETL logic without needing access to a
                    paid Databricks workspace.
                </p>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Location</th>
                            <th>What It Shows</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>PySpark notebooks</td>
                            <td>Databricks/notebooks</td>
                            <td>Bronze ingest, Silver cleaning, Gold summaries, and reporting exports.</td>
                        </tr>
                        <tr>
                            <td>Sample data</td>
                            <td>Databricks/sample-data</td>
                            <td>Banking customers, accounts, transactions, and loan application extracts.</td>
                        </tr>
                        <tr>
                            <td>SQL views</td>
                            <td>Databricks/sql</td>
                            <td>Reporting-friendly views over Gold layer tables.</td>
                        </tr>
                        <tr>
                            <td>Sample outputs</td>
                            <td>Databricks/sample-output</td>
                            <td>Example Gold and reporting results that demonstrate the expected analytics output.</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </main>
    );
}