import React from "react";
import { getDashboardSummary } from "../api/dashboardApi";
import type { DashboardSummary } from "../types/dashboardTypes";

export function DashboardPage() {
    const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                setError("");

                const data = await getDashboardSummary();
                setSummary(data);
            } catch (err) {
                console.error("Failed to load dashboard summary:", err);
                setError("Failed to load dashboard summary. Login may be required.");
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    return (
        <main className="page">
            <div className="page-header">
                <h1>FinSight</h1>
                <p>
                    Enterprise banking demo with customers, accounts, transactions,
                    loan workflows, JWT authentication, audit logging, and future Azure
                    Databricks reporting.
                </p>
            </div>

            {loading && <p>Loading dashboard...</p>}

            {error && <p className="error">{error}</p>}

            {!loading && !error && summary && (
                <>
                    <section className="cards">
                        <div className="card">
                            <h2>{summary.customerCount}</h2>
                            <p>Customers</p>
                        </div>

                        <div className="card">
                            <h2>{summary.accountCount}</h2>
                            <p>Accounts</p>
                        </div>

                        <div className="card">
                            <h2>{summary.loanApplicationCount}</h2>
                            <p>Loan Applications</p>
                        </div>

                        <div className="card">
                            <h2>{summary.openLoanApplicationCount}</h2>
                            <p>Open Loan Decisions</p>
                        </div>
                    </section>

                    <section className="dashboard-section">
                        <div className="card">
                            <h2>Portfolio Status</h2>
                            <p>
                                Core banking workflows are connected to live API data. Customer,
                                account, loan, and transaction screens are now using the FinSight
                                backend with JWT-secured API calls.
                            </p>
                        </div>

                        <div className="card">
                            <h2>Known Issues</h2>
                            <p>
                                Account balance display is tracked as a separate bug because the
                                frontend and API balance field mapping need to be aligned.
                            </p>
                        </div>

                        <div className="card">
                            <h2>Databricks Roadmap</h2>
                            <p>
                                Future reporting will use Azure Databricks-style Bronze, Silver,
                                and Gold processing layers for transaction analytics and lending
                                insights.
                            </p>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}