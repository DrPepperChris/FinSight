import React from "react";
import { getCustomers } from "../api/customersApi";
import type { Customer } from "../types/customerTypes";
import { PaginationControls } from "../../../components/pagination/PaginationControls";
import { usePagination } from "../../../hooks/usePagination";
import { TableSearchSortBar } from "../../../components/table/TableSearchSortBar";

type CustomerSortField =
    | "customerNumber"
    | "name"
    | "email"
    | "riskRating"
    | "createdDate";

export function CustomersPage() {
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [totalCount, setTotalCount] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [sortField, setSortField] =
        React.useState<CustomerSortField>("customerNumber");
    const [sortDirection, setSortDirection] =
        React.useState<"asc" | "desc">("asc");

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

    function getCustomerName(customer: Customer) {
        return (
            customer.fullName ??
            `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim()
        );
    }

    function getCustomerCreatedDate(customer: Customer) {
        return customer.createdDate
            ? new Date(customer.createdDate).toLocaleDateString()
            : "";
    }

    function getSearchText(customer: Customer) {
        return [
            customer.customerNumber,
            getCustomerName(customer),
            customer.email,
            customer.riskRating,
            getCustomerCreatedDate(customer)
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
    }

    function getSortValue(customer: Customer, field: CustomerSortField) {
        switch (field) {
            case "customerNumber":
                return String(customer.customerNumber ?? "");

            case "name":
                return getCustomerName(customer);

            case "email":
                return String(customer.email ?? "");

            case "riskRating":
                return String(customer.riskRating ?? "");

            case "createdDate":
                return customer.createdDate
                    ? new Date(customer.createdDate).getTime()
                    : 0;

            default:
                return "";
        }
    }

    const sortedCustomers = React.useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const searchedCustomers = customers.filter((customer) => {
            return (
                !normalizedSearch ||
                getSearchText(customer).includes(normalizedSearch)
            );
        });

        return [...searchedCustomers].sort((a, b) => {
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
    }, [customers, searchTerm, sortField, sortDirection]);

    const customerPage = usePagination(sortedCustomers, 10);

    return (
        <main className="page">
            <div className="page-header">
                <h1>Customers</h1>
                <p>Customer profiles loaded from the FinSight API.</p>
            </div>

            <p>
                Status: {loading ? "Loading" : "Finished"} | Showing:{" "}
                {sortedCustomers.length} | Total: {totalCount}
            </p>

            {loading && <p>Loading customers...</p>}

            {error && <p className="error">{error}</p>}

            {!loading && !error && customers.length === 0 && (
                <p>No customers found.</p>
            )}

            {!loading && !error && customers.length > 0 && (
                <div className="table-card">
                    <TableSearchSortBar<CustomerSortField>
                        isSearchOpen={isSearchOpen}
                        searchTerm={searchTerm}
                        searchPlaceholder="Search customers..."
                        sortField={sortField}
                        sortDirection={sortDirection}
                        sortOptions={[
                            { value: "customerNumber", label: "Customer #" },
                            { value: "name", label: "Name" },
                            { value: "email", label: "Email" },
                            { value: "riskRating", label: "Risk Rating" },
                            { value: "createdDate", label: "Created Date" }
                        ]}
                        onToggleSearch={() => setIsSearchOpen((current) => !current)}
                        onSearchTermChange={setSearchTerm}
                        onSortFieldChange={setSortField}
                        onSortDirectionChange={setSortDirection}
                    />

                    {sortedCustomers.length === 0 ? (
                        <p>No customers match your search.</p>
                    ) : (
                        <>
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
                                    {customerPage.rows.map((customer) => (
                                        <tr key={customer.id}>
                                            <td>{customer.customerNumber}</td>
                                            <td>{getCustomerName(customer) || "-"}</td>
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

                            <PaginationControls
                                currentPage={customerPage.currentPage}
                                totalPages={customerPage.totalPages}
                                totalRows={customerPage.totalRows}
                                pageSize={customerPage.pageSize}
                                onPrevious={customerPage.goPrevious}
                                onNext={customerPage.goNext}
                            />
                        </>
                    )}
                </div>
            )}
        </main>
    );
}