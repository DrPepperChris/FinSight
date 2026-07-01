import { apiClient } from "../../../lib/apiClient";
import type { AuditLog } from "../types/auditLogTypes";

export async function getAuditLogs(count = 100): Promise<AuditLog[]> {
    const response = await apiClient.get<AuditLog[]>(`/api/AuditLogs?count=${count}`);
    return response.data;
}