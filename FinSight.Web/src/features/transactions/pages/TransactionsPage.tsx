import React from "react";
import { getAccounts } from "../../accounts/api/accountsApi";
import type { Account } from "../../accounts/types/accountTypes";
import { getAccountTransactions } from "../api/transactionsApi";
import type { Transaction } from "../types/transactionTypes";
import { PaginationControls } from "../../../components/pagination/PaginationControls";
import { usePagination } from "../../../hooks/usePagination";

export function TransactionsPage() {
    const [accounts, setAccounts] = React.useState<Account[]>([]);
    const [selectedAccountId, setSelectedAccountId] = React.useState<number | "">("");
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [loadingAccounts, setLoadingAccounts] = React.useState(true);
    const [loadingTransactions, setLoadingTransactions] = React.useState(false);
    const [error, setError] = React.useState("");
    const transactionPage = usePagination(transactions, 10);

    React.useEffect(() => {
        async function loadAccounts() {
            try {
                setLoadingAccounts(true);
                setError("");

                const result = await getAccounts();
                const accountItems = result.items ?? [];

                setAccounts(accountItems);

                if (accountItems.length > 0) {
                    setSelectedAccountId(accountItems[0].id);
                }
            } catch (err) {
                console.error("Failed to load accounts for transactions:", err);
                setError("Failed to load accounts. Make sure you are logged in.");
            } finally {
                setLoadingAccounts(false);
            }
        }

        loadAccounts();
    }, []);

    React.useEffect(() => {
        async function loadTransactions() {
            if (!selectedAccountId) {
                return;
            }

            try {
                setLoadingTransactions(true);
                setError("");

                const data = await getAccountTransactions(Number(selectedAccountId));

                setTransactions(data ?? []);
            } catch (err) {
                console.error("Failed to load transactions:", err);
                setError("Failed to load transactions for the selected account.");
            } finally {
                setLoadingTransactions(false);
            }
        }

        loadTransactions();
    }, [selectedAccountId]);

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

    function getAccountDisplayName(account: Account) {
        const accountNumber = account.accountNumber ?? `Account ${account.id}`;
        const customer = account.customerName ?? account.customerId ?? "Unknown Customer";

        return `${accountNumber} - ${customer}`;
    }

    return (
        <main className="page">
            <div className="page-header">
                <h1>Transactions</h1>
                <p>Transaction history loaded by account from the FinSight API.</p>
            </div>

            {loadingAccounts && <p>Loading accounts...</p>}

            {error && <p className="error">{error}</p>}

            {!loadingAccounts && accounts.length > 0 && (
                <>
                    <div className="transaction-filter">
                        <label htmlFor="accountId">Select Account</label>

                        <select
                            id="accountId"
                            className="account-select"
                            value={selectedAccountId}
                            onChange={(event) => setSelectedAccountId(Number(event.target.value))}
                        >
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {getAccountDisplayName(account)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <p>
                        Status: {loadingTransactions ? "Loading" : "Finished"} | Count:{" "}
                        {transactions.length}
                    </p>

                    {loadingTransactions && <p>Loading transactions...</p>}

                    {!loadingTransactions && transactions.length === 0 && (
                        <p>No transactions found for this account.</p>
                    )}

                    {!loadingTransactions && transactions.length > 0 && (
                        <div className="table-card">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Account</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transactionPage.rows.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>
                                                {formatDate(
                                                    transaction.transactionDate ?? transaction.createdDate
                                                )}
                                            </td>
                                            <td>
                                                {transaction.accountNumber ??
                                                    transaction.accountId ??
                                                    selectedAccountId}
                                            </td>
                                            <td>{transaction.transactionType ?? "-"}</td>
                                            <td>{formatCurrency(transaction.amount)}</td>
                                            <td>{transaction.description ?? "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <PaginationControls
                                currentPage={transactionPage.currentPage}
                                totalPages={transactionPage.totalPages}
                                totalRows={transactionPage.totalRows}
                                pageSize={transactionPage.pageSize}
                                onPrevious={transactionPage.goPrevious}
                                onNext={transactionPage.goNext}
                            />
                        </div>
                    )}
                </>
            )}

            {!loadingAccounts && accounts.length === 0 && !error && (
                <p>No accounts found. Transactions require an account first.</p>
            )}
        </main>
    );
}