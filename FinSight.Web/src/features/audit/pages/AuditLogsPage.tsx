import React from "react";
import { getAuditLogs } from "../api/auditLogsApi";
import type { AuditLog } from "../types/auditLogTypes";
import { PaginationControls } from "../../../components/pagination/PaginationControls";
import { usePagination } from "../../../hooks/usePagination";
import { TableSearchSortBar } from "../../../components/table/TableSearchSortBar";

type AuditSortField =
    | "date"
    | "user"
    | "action"
    | "entity"
    | "entityId"
    | "details";

export function AuditLogsPage() {
    const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [sortField, setSortField] =
        React.useState<AuditSortField>("date");
    const [sortDirection, setSortDirection] =
        React.useState<"asc" | "desc">("desc");

    React.useEffect(() => {
        loadAuditLogs();
    }, []);

    async function loadAuditLogs() {
        try {
            setLoading(true);
            setError("");

            const logs = await getAuditLogs(100);

            setAuditLogs(logs);
        } catch {
            setError("Failed to load audit logs.");
        } finally {
            setLoading(false);
        }
    }

    function formatDate(value?: string) {
        if (!value) {
            return "-";
        }

        return new Date(value).toLocaleString();
    }

    function getLogDate(log: AuditLog) {
        return formatDate(log.timestampUtc ?? log.createdDate);
    }

    function getLogDateValue(log: AuditLog) {
        const dateValue = log.timestampUtc ?? log.createdDate;

        return dateValue ? new Date(dateValue).getTime() : 0;
    }

    function getSearchText(log: AuditLog) {
        return [
            getLogDate(log),
            log.userName,
            log.action,
            log.entityName,
            log.entityId,
            log.details
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
    }

    function getSortValue(log: AuditLog, field: AuditSortField) {
        switch (field) {
            case "date":
                return getLogDateValue(log);

            case "user":
                return String(log.userName ?? "");

            case "action":
                return String(log.action ?? "");

            case "entity":
                return String(log.entityName ?? "");

            case "entityId":
                return String(log.entityId ?? "");

            case "details":
                return String(log.details ?? "");

            default:
                return "";
        }
    }

    const sortedAuditLogs = React.useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const searchedLogs = auditLogs.filter((log) => {
            return (
                !normalizedSearch ||
                getSearchText(log).includes(normalizedSearch)
            );
        });

        return [...searchedLogs].sort((a, b) => {
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
    }, [auditLogs, searchTerm, sortField, sortDirection]);

    const auditLogPage = usePagination(sortedAuditLogs, 10);

    return (
        <main className="page">
            <div className="page-header">
                <h1>Audit Logs</h1>
                <p>Recent application activity and administrative actions.</p>
            </div>

            <button type="button" onClick={loadAuditLogs}>
                Refresh
            </button>

            <p>
                Status: {loading ? "Loading" : "Finished"} | Showing:{" "}
                {sortedAuditLogs.length} | Total: {auditLogs.length}
            </p>

            {loading && <p>Loading audit logs...</p>}

            {error && <p className="error">{error}</p>}

            {!loading && !error && auditLogs.length === 0 && (
                <p>No audit logs found.</p>
            )}

            {!loading && !error && auditLogs.length > 0 && (
                <div className="table-card">
                    <TableSearchSortBar<AuditSortField>
                        isSearchOpen={isSearchOpen}
                        searchTerm={searchTerm}
                        searchPlaceholder="Search audit logs..."
                        sortField={sortField}
                        sortDirection={sortDirection}
                        sortOptions={[
                            { value: "date", label: "Date" },
                            { value: "user", label: "User" },
                            { value: "action", label: "Action" },
                            { value: "entity", label: "Entity" },
                            { value: "entityId", label: "Entity ID" },
                            { value: "details", label: "Details" }
                        ]}
                        onToggleSearch={() => setIsSearchOpen((current) => !current)}
                        onSearchTermChange={setSearchTerm}
                        onSortFieldChange={setSortField}
                        onSortDirectionChange={setSortDirection}
                    />

                    {sortedAuditLogs.length === 0 ? (
                        <p>No audit logs match your search.</p>
                    ) : (
                        <>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Entity</th>
                                        <th>Entity ID</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {auditLogPage.rows.map((log) => (
                                        <tr key={log.id}>
                                            <td>{getLogDate(log)}</td>
                                            <td>{log.userName ?? "-"}</td>
                                            <td>{log.action ?? "-"}</td>
                                            <td>{log.entityName ?? "-"}</td>
                                            <td>{log.entityId ?? "-"}</td>
                                            <td>{log.details ?? "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <PaginationControls
                                currentPage={auditLogPage.currentPage}
                                totalPages={auditLogPage.totalPages}
                                totalRows={auditLogPage.totalRows}
                                pageSize={auditLogPage.pageSize}
                                onPrevious={auditLogPage.goPrevious}
                                onNext={auditLogPage.goNext}
                            />
                        </>
                    )}
                </div>
            )}
        </main>
    );
}