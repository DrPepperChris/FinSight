import React from "react";
import { getAccounts } from "../api/accountsApi";
import type { Account } from "../types/accountTypes";

export function AccountsPage() {
    const [accounts, setAccounts] = React.useState<Account[]>([]);
    const [totalCount, setTotalCount] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        async function loadAccounts() {
            try {
                setLoading(true);
                setError("");

                const result = await getAccounts();

                console.log("Accounts page result:", result);

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

    return (
        <main className="page">
            <div className="page-header">
                <h1>Accounts</h1>
                <p>Bank accounts loaded from the FinSight API.</p>
            </div>

            <p>
                Status: {loading ? "Loading" : "Finished"} | Count: {accounts.length} |
                Total: {totalCount}
            </p>

            {loading && <p>Loading accounts...</p>}

            {error && <p className="error">{error}</p>}

            {!loading && !error && accounts.length === 0 && (
                <p>No accounts found.</p>
            )}

            {!loading && !error && accounts.length > 0 && (
                <div className="table-card">
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
                            {accounts.map((account) => (
                                <tr key={account.id}>
                                    <td>{account.accountNumber ?? "-"}</td>
                                    <td>{account.customerName ?? account.customerId ?? "-"}</td>
                                    <td>{account.accountType ?? "-"}</td>
                                    <td>{formatCurrency(account.availableBalance ?? account.balance)}</td>
                                    <td>{account.status ?? "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}