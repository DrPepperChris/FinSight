import React from "react";
import { getAccounts } from "../api/accountsApi";
import type { Account } from "../types/accountTypes";
import { PaginationControls } from "../../../components/pagination/PaginationControls";
import { usePagination } from "../../../hooks/usePagination";
import { TableSearchSortBar } from "../../../components/table/TableSearchSortBar";

type AccountSortField =
    | "accountNumber"
    | "customer"
    | "accountType"
    | "balance"
    | "status";

export function AccountsPage() {
    const [accounts, setAccounts] = React.useState<Account[]>([]);
    const [totalCount, setTotalCount] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [sortField, setSortField] =
        React.useState<AccountSortField>("accountNumber");
    const [sortDirection, setSortDirection] =
        React.useState<"asc" | "desc">("asc");

    React.useEffect(() => {
        async function loadAccounts() {
            try {
                setLoading(true);
                setError("");

                const result = await getAccounts();

                setAccounts(result.items ?? []);
                setTotalCount(result.totalCount ?? 0);
            } catch (err) {
                console.error("Failed to load accounts:", err);
                setError("Failed to load accounts. Make sure you are logged in.");
            } finally {
                setLoading(false);
            }
        }

        loadAccounts();
    }, []);

    function formatCurrency(value?: number) {
        if (typeof value !== "number") {
            return "-";
        }

        return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });
    }

    function getBalance(account: Account) {
        return account.availableBalance ?? account.balance;
    }

    function getSearchText(account: Account) {
        return [
            account.accountNumber,
            account.customerName,
            account.customerId,
            account.accountType,
            getBalance(account),
            account.status
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
    }

    function getSortValue(account: Account, field: AccountSortField) {
        switch (field) {
            case "accountNumber":
                return String(account.accountNumber ?? "");

            case "customer":
                return String(account.customerName ?? account.customerId ?? "");

            case "accountType":
                return String(account.accountType ?? "");

            case "balance":
                return getBalance(account) ?? 0;

            case "status":
                return String(account.status ?? "");

            default:
                return "";
        }
    }

    const sortedAccounts = React.useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const searchedAccounts = accounts.filter((account) => {
            return (
                !normalizedSearch ||
                getSearchText(account).includes(normalizedSearch)
            );
        });

        return [...searchedAccounts].sort((a, b) => {
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
    }, [accounts, searchTerm, sortField, sortDirection]);

    const accountPage = usePagination(sortedAccounts, 10);

    return (
        <main className="page">
            <div className="page-header">
                <h1>Accounts</h1>
                <p>Bank accounts loaded from the FinSight API.</p>
            </div>

            <p>
                Status: {loading ? "Loading" : "Finished"} | Showing:{" "}
                {sortedAccounts.length} | Total: {totalCount}
            </p>

            {loading && <p>Loading accounts...</p>}

            {error && <p className="error">{error}</p>}

            {!loading && !error && accounts.length === 0 && (
                <p>No accounts found.</p>
            )}

            {!loading && !error && accounts.length > 0 && (
                <div className="table-card">
                    <TableSearchSortBar<AccountSortField>
                        isSearchOpen={isSearchOpen}
                        searchTerm={searchTerm}
                        searchPlaceholder="Search accounts..."
                        sortField={sortField}
                        sortDirection={sortDirection}
                        sortOptions={[
                            { value: "accountNumber", label: "Account #" },
                            { value: "customer", label: "Customer" },
                            { value: "accountType", label: "Type" },
                            { value: "balance", label: "Balance" },
                            { value: "status", label: "Status" }
                        ]}
                        onToggleSearch={() => setIsSearchOpen((current) => !current)}
                        onSearchTermChange={setSearchTerm}
                        onSortFieldChange={setSortField}
                        onSortDirectionChange={setSortDirection}
                    />

                    {sortedAccounts.length === 0 ? (
                        <p>No accounts match your search.</p>
                    ) : (
                        <>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Account #</th>
                                        <th>Customer</th>
                                        <th>Type</th>
                                        <th>Balance</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {accountPage.rows.map((account) => (
                                        <tr key={account.id}>
                                            <td>{account.accountNumber ?? "-"}</td>
                                            <td>
                                                {account.customerName ??
                                                    account.customerId ??
                                                    "-"}
                                            </td>
                                            <td>{account.accountType ?? "-"}</td>
                                            <td>{formatCurrency(getBalance(account))}</td>
                                            <td>{account.status ?? "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <PaginationControls
                                currentPage={accountPage.currentPage}
                                totalPages={accountPage.totalPages}
                                totalRows={accountPage.totalRows}
                                pageSize={accountPage.pageSize}
                                onPrevious={accountPage.goPrevious}
                                onNext={accountPage.goNext}
                            />
                        </>
                    )}
                </div>
            )}
        </main>
    );
}