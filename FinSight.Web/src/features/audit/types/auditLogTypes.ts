export interface AuditLog {
    id: number;
    userName?: string;
    action?: string;
    entityName?: string;
    entityId?: string;
    details?: string;
    timestampUtc?: string;
    createdDate?: string;
}