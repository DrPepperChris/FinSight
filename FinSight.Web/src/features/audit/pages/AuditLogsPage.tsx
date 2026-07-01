import React from "react";
import { getAuditLogs } from "../api/auditLogsApi";
import type { AuditLog } from "../types/auditLogTypes";

export function AuditLogsPage() {
    const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

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

    return (
        <section className="page-card">
            <div className="page-header">
                <div>
                    <h1>Audit Logs</h1>
                    <p>Recent application activity and administrative actions.</p>
                </div>
                <button type="button" className="button secondary-button" onClick={loadAuditLogs}>
                    Refresh
                </button>
            </div>

            {loading && <p>Loading audit logs...</p>}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && auditLogs.length === 0 && (
                <p>No audit logs found.</p>
            )}

            {!loading && !error && auditLogs.length > 0 && (
                <div className="table-wrapper">
                    <table>
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
                            {auditLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>{formatDate(log.timestampUtc ?? log.createdDate)}</td>
                                    <td>{log.userName ?? "-"}</td>
                                    <td>{log.action ?? "-"}</td>
                                    <td>{log.entityName ?? "-"}</td>
                                    <td>{log.entityId ?? "-"}</td>
                                    <td>{log.details ?? "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}