using FinSight.Core.DTOs;
using FinSight.Core.Entities;
using FinSight.Core.Interfaces;
using FinSight.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FinSight.Data.Services
{
    public class AuditService : IAuditService
    {
        private readonly FinSightDbContext _context;

        public AuditService(FinSightDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(AuditLog auditLog)
        {
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditLogDto>> GetRecentAsync(int count = 50)
        {
            return await _context.AuditLogs
                .OrderByDescending(a => a.Timestamp)
                .Take(count)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id,
                    Timestamp = a.Timestamp,
                    UserName = a.UserName,
                    UserRole = a.UserRole,
                    Action = a.Action,
                    EntityName = a.EntityName,
                    Status = a.Status,
                    IpAddress = a.IpAddress,
                    CorrelationId = a.CorrelationId,
                    Details = a.Details
                })
                .ToListAsync();
        }
    }
}