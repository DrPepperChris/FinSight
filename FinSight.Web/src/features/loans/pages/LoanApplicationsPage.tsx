import React from "react";
import {
    approveLoanApplication,
    getLoanApplications,
    rejectLoanApplication
} from "../api/loanApplicationsApi";
import type { LoanApplication } from "../types/loanApplicationTypes";

export function LoanApplicationsPage() {
    const [loanApplications, setLoanApplications] = React.useState<LoanApplication[]>([]);
    const [totalCount, setTotalCount] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [actionLoadingId, setActionLoadingId] = React.useState<number | null>(null);
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");

    React.useEffect(() => {
        loadLoanApplications();
    }, []);

    async function loadLoanApplications() {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            const result = await getLoanApplications();

            setLoanApplications(result.items ?? []);
            setTotalCount(result.totalCount ?? result.totalRecords ?? 0);
        } catch (err) {
            console.error("Failed to load loan applications:", err);
            setError("Failed to load loan applications. Make sure you are logged in.");
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(id: number) {
        try {
            setActionLoadingId(id);
            setError("");
            setMessage("");

            await approveLoanApplication(id);
            setMessage("Loan application approved.");
            await loadLoanApplications();
        } catch (err) {
            console.error("Failed to approve loan application:", err);
            setError("Failed to approve loan application.");
        } finally {
            setActionLoadingId(null);
        }
    }

    async function handleReject(id: number) {
        try {
            setActionLoadingId(id);
            setError("");
            setMessage("");

            await rejectLoanApplication(id);
            setMessage("Loan application rejected.");
            await loadLoanApplications();
        } catch (err) {
            console.error("Failed to reject loan application:", err);
            setError("Failed to reject loan application.");
        } finally {
            setActionLoadingId(null);
        }
    }

    function formatCurrency(value?: number) {
        if (typeof value !== "number") {
            return "-";
        }

        return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });
    }

    function formatDate(value?: string) {
        if (!value) {
            return "-";
        }

        return new Date(value).toLocaleDateString();
    }

    function getAmount(loanApplication: LoanApplication) {
        return (
            loanApplication.requestedAmount ??
            loanApplication.loanAmount ??
            loanApplication.amount
        );
    }

    function getPurpose(loanApplication: LoanApplication) {
        return loanApplication.loanPurpose ?? loanApplication.purpose ?? "-";
    }

    function getStatus(loanApplication: LoanApplication) {
        return (
            loanApplication.status ??
            loanApplication.applicationStatus ??
            "-"
        );
    }

    function getCreatedDate(loanApplication: LoanApplication) {
        return (
            loanApplication.submittedDate ??
            loanApplication.createdDate ??
            loanApplication.decisionDate
        );
    }

    return (
        <main className="page">
            <div className="page-header">
                <h1>Loan Applications</h1>
                <p>Loan application workflow loaded from the FinSight API.</p>
            </div>

            <p>
                Status: {loading ? "Loading" : "Finished"} | Count:{" "}
                {loanApplications.length} | Total: {totalCount}
            </p>

            {loading && <p>Loading loan applications...</p>}

            {message && <p className="success">{message}</p>}

            {error && <p className="error">{error}</p>}

            {!loading && !error && loanApplications.length === 0 && (
                <p>No loan applications found.</p>
            )}

            {!loading && !error && loanApplications.length > 0 && (
                <div className="table-card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Purpose</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loanApplications.map((loanApplication) => {
                                const status = getStatus(loanApplication);
                                const isFinal =
                                    status.toLowerCase() === "approved" ||
                                    status.toLowerCase() === "rejected";

                                return (
                                    <tr key={loanApplication.id}>
                                        <td>
                                            {loanApplication.customerName ??
                                                loanApplication.customerId ??
                                                "-"}
                                        </td>
                                        <td>{formatCurrency(getAmount(loanApplication))}</td>
                                        <td>{getPurpose(loanApplication)}</td>
                                        <td>{status}</td>
                                        <td>{formatDate(getCreatedDate(loanApplication))}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    type="button"
                                                    className="small-button"
                                                    disabled={isFinal || actionLoadingId === loanApplication.id}
                                                    onClick={() => handleApprove(loanApplication.id)}
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    type="button"
                                                    className="small-button danger-button"
                                                    disabled={isFinal || actionLoadingId === loanApplication.id}
                                                    onClick={() => handleReject(loanApplication.id)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}