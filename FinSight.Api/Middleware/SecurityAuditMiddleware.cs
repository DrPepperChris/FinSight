using FinSight.Core.Entities;
using FinSight.Core.Interfaces;
using System.Security.Claims;

namespace FinSight.Api.Middleware
{
    public class SecurityAuditMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityAuditMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IAuditService auditService)
        {
            await _next(context);

            if (context.Response.StatusCode == StatusCodes.Status401Unauthorized ||
                context.Response.StatusCode == StatusCodes.Status403Forbidden)
            {
                var user = context.User;

                var auditLog = new AuditLog
                {
                    UserName = user.Identity?.IsAuthenticated == true
                        ? user.Identity.Name ?? "Unknown"
                        : "Anonymous",

                    UserRole = user.FindFirst(ClaimTypes.Role)?.Value ?? "Unknown",
                    Action = $"{context.Request.Method} {context.Request.Path}",
                    EntityName = context.Request.Path.Value?.Split('/', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? "Unknown",
                    EntityId = string.Empty,
                    Status = context.Response.StatusCode == 401 ? "Unauthorized" : "Forbidden",
                    IpAddress = context.Connection.RemoteIpAddress?.ToString() ?? string.Empty,
                    CorrelationId = context.TraceIdentifier,
                    Details = $"Security response {context.Response.StatusCode}"
                };

                await auditService.LogAsync(auditLog);
            }
        }
    }
}