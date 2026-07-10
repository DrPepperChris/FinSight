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
import { TableSearchSortBar } from "../../../components/table/TableSearchSortBar";

type LoanSortField =
    | "customer"
    | "amount"
    | "purpose"
    | "status"
    | "submitted";

export function LoanApplicationsPage() {
    const [loanApplications, setLoanApplications] = React.useState<LoanApplication[]>([]);
    const [totalCount, setTotalCount] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [actionLoadingId, setActionLoadingId] = React.useState<number | null>(null);
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");

    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [sortField, setSortField] =
        React.useState<LoanSortField>("submitted");
    const [sortDirection, setSortDirection] =
        React.useState<"asc" | "desc">("desc");

    const { hasRole } = useAuth();
    const canManageLoans = hasRole(["Admin"]);

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

    function getCreatedDateValue(loanApplication: LoanApplication) {
        const dateValue = getCreatedDate(loanApplication);

        return dateValue ? new Date(dateValue).getTime() : 0;
    }

    function getSearchText(loanApplication: LoanApplication) {
        return [
            loanApplication.customerName,
            loanApplication.customerId,
            getAmount(loanApplication),
            getPurpose(loanApplication),
            getStatus(loanApplication),
            formatDate(getCreatedDate(loanApplication))
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
    }

    function getSortValue(
        loanApplication: LoanApplication,
        field: LoanSortField
    ) {
        switch (field) {
            case "customer":
                return String(
                    loanApplication.customerName ??
                    loanApplication.customerId ??
                    ""
                );

            case "amount":
                return getAmount(loanApplication) ?? 0;

            case "purpose":
                return String(getPurpose(loanApplication));

            case "status":
                return String(getStatus(loanApplication));

            case "submitted":
                return getCreatedDateValue(loanApplication);

            default:
                return "";
        }
    }

    const sortedLoanApplications = React.useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const searchedLoanApplications = loanApplications.filter((loanApplication) => {
            return (
                !normalizedSearch ||
                getSearchText(loanApplication).includes(normalizedSearch)
            );
        });

        return [...searchedLoanApplications].sort((a, b) => {
            const aValue = getSortValue(a, sortField);
            const bValue = getSortValue(b, sortField);

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortDirection === "asc"
                    ? aValue - bValue
                    : bValue - aValue;
            }

            const result = String(aValue).localeCompare(String(bValue), undefined, {
                numeric: true,
                sensitivity: "base"
            });

            return sortDirection === "asc" ? result : -result;
        });
    }, [loanApplications, searchTerm, sortField, sortDirection]);

    const loanApplicationPage = usePagination(sortedLoanApplications, 10);

    return (
        <main className="page">
            <div className="page-header">
                <h1>Loan Applications</h1>
                <p>Loan application workflow loaded from the FinSight API.</p>
            </div>

            <p>
                Status: {loading ? "Loading" : "Finished"} | Showing:{" "}
                {sortedLoanApplications.length} | Total: {totalCount}
            </p>

            {loading && <p>Loading loan applications...</p>}

            {message && <p className="success">{message}</p>}

            {error && <p className="error">{error}</p>}

            {!loading && !error && loanApplications.length === 0 && (
                <p>No loan applications found.</p>
            )}

            {!loading && !error && loanApplications.length > 0 && (
                <div className="table-card">
                    <TableSearchSortBar<LoanSortField>
                        isSearchOpen={isSearchOpen}
                        searchTerm={searchTerm}
                        searchPlaceholder="Search loans..."
                        sortField={sortField}
                        sortDirection={sortDirection}
                        sortOptions={[
                            { value: "customer", label: "Customer" },
                            { value: "amount", label: "Amount" },
                            { value: "purpose", label: "Purpose" },
                            { value: "status", label: "Status" },
                            { value: "submitted", label: "Submitted" }
                        ]}
                        onToggleSearch={() => setIsSearchOpen((current) => !current)}
                        onSearchTermChange={setSearchTerm}
                        onSortFieldChange={setSortField}
                        onSortDirectionChange={setSortDirection}
                    />

                    {sortedLoanApplications.length === 0 ? (
                        <p>No loan applications match your search.</p>
                    ) : (
                        <>
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
                                                                disabled={
                                                                    actionLoadingId === loanApplication.id
                                                                }
                                                                onClick={() =>
                                                                    handleApprove(loanApplication.id)
                                                                }
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="small-button danger-button"
                                                                disabled={
                                                                    actionLoadingId === loanApplication.id
                                                                }
                                                                onClick={() =>
                                                                    handleReject(loanApplication.id)
                                                                }
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
                        </>
                    )}
                </div>
            )}
        </main>
    );
}