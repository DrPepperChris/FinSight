using FinSight.Core.DTOs;
using FinSight.Core.Entities;

namespace FinSight.Core.Interfaces
{
    public interface IAuditService
    {
        Task LogAsync(AuditLog auditLog);
        Task<IEnumerable<AuditLogDto>> GetRecentAsync(int count = 50);
    }
}