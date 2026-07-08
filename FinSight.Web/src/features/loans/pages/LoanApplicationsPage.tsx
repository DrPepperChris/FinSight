import React from "react";
import {
    approveLoanApplication,
    getLoanApplications,
    rejectLoanApplication
} from "../api/loanApplicationsApi";
import type { LoanApplication } from "../types/loanApplicationTypes";
import { useAuth } from "../../auth/authContext/AuthContext";
import { PaginationControls } from "../../../components/pagination/PaginationControls";
import { usePagination } from "../../../hooks/usePagination";

export function LoanApplicationsPage() {
    const [loanApplications, setLoanApplications] = React.useState<LoanApplication[]>([]);
    const [totalCount, setTotalCount] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [actionLoadingId, setActionLoadingId] = React.useState<number | null>(null);
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");

    const { hasRole } = useAuth();
    const canManageLoans = hasRole(["Admin"]);

    const loanApplicationPage = usePagination(loanApplications, 10);

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
        const apiLoanApplication = loanApplication as LoanApplication & {
            LoanType?: string;
            LoanPurpose?: string;
            Purpose?: string;
        };

        return (
            loanApplication.loanType ??
            apiLoanApplication.LoanType ??
            loanApplication.loanPurpose ??
            apiLoanApplication.LoanPurpose ??
            loanApplication.purpose ??
            apiLoanApplication.Purpose ??
            "-"
        );
    }

    function getStatus(loanApplication: LoanApplication) {
        const apiLoanApplication = loanApplication as LoanApplication & {
            Status?: string | number;
            ApplicationStatus?: string | number;
        };

        return (
            loanApplication.status ??
            apiLoanApplication.Status ??
            loanApplication.applicationStatus ??
            apiLoanApplication.ApplicationStatus ??
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
                            {loanApplicationPage.rows.map((loanApplication) => {
                                const status = String(getStatus(loanApplication));
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
                                            {canManageLoans && !isFinal ? (
                                                <div className="table-actions">
                                                    <button
                                                        type="button"
                                                        className="small-button"
                                                        disabled={actionLoadingId === loanApplication.id}
                                                        onClick={() => handleApprove(loanApplication.id)}
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="small-button danger-button"
                                                        disabled={actionLoadingId === loanApplication.id}
                                                        onClick={() => handleReject(loanApplication.id)}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="muted-text">
                                                    {isFinal ? "Final" : "Read only"}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <PaginationControls
                        currentPage={loanApplicationPage.currentPage}
                        totalPages={loanApplicationPage.totalPages}
                        totalRows={loanApplicationPage.totalRows}
                        pageSize={loanApplicationPage.pageSize}
                        onPrevious={loanApplicationPage.goPrevious}
                        onNext={loanApplicationPage.goNext}
                    />
                </div>
            )}
        </main>
    );
}