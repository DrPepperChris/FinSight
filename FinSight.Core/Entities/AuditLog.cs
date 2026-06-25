namespace FinSight.Core.Entities
{
    public class AuditLog
    {
        public int Id { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public string UserName { get; set; } = string.Empty;

        public string UserRole { get; set; } = string.Empty;

        public string Action { get; set; } = string.Empty;

        public string EntityName { get; set; } = string.Empty;

        public string EntityId { get; set; } = string.Empty;

        public string Status { get; set; } = "Success";

        public string IpAddress { get; set; } = string.Empty;

        public string CorrelationId { get; set; } = string.Empty;

        public string? Details { get; set; }
    }
}