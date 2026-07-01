import React from "react";
import { getCustomers } from "../api/customersApi";
import type { Customer } from "../types/customerTypes";

export function CustomersPage() {
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [totalCount, setTotalCount] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        async function loadCustomers() {
            try {
                setLoading(true);
                setError("");

                const result = await getCustomers();

                setCustomers(result.items);
                setTotalCount(result.totalCount);
            } catch (err) {
                console.error("Failed to load customers:", err);
                setError("Failed to load customers. Make sure you are logged in.");
            } finally {
                setLoading(false);
            }
        }

        loadCustomers();
    }, []);

    return (
        <main className="page">
            <div className="page-header">
                <h1>Customers</h1>
                <p>Customer profiles loaded from the FinSight API.</p>
            </div>

            <p>
                Status: {loading ? "Loading" : "Finished"} | Count: {customers.length} |
                Total: {totalCount}
            </p>

            {loading && <p>Loading customers...</p>}

            {error && <p className="error">{error}</p>}

            {!loading && !error && customers.length === 0 && (
                <p>No customers found.</p>
            )}

            {!loading && !error && customers.length > 0 && (
                <div className="table-card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Customer #</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Risk Rating</th>
                                <th>Created</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>{customer.customerNumber}</td>
                                    <td>
                                        {customer.fullName ?? (`${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() || "-")}
                                    </td>
                                    <td>{customer.email}</td>
                                    <td>{customer.riskRating}</td>
                                    <td>
                                        {customer.createdDate
                                            ? new Date(customer.createdDate).toLocaleDateString()
                                            : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}