using FinSight.Core.Entities;
using FinSight.Core.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace FinSight.Api.Filters
{
    public class AuditLogActionFilter : IAsyncActionFilter
    {
        private readonly IAuditService _auditService;

        public AuditLogActionFilter(IAuditService auditService)
        {
            _auditService = auditService;
        }

        public async Task OnActionExecutionAsync(
            ActionExecutingContext context,
            ActionExecutionDelegate next)
        {
            var executedContext = await next();

            var user = context.HttpContext.User;

            var auditLog = new AuditLog
            {
                UserName = user.Identity?.Name ?? "Anonymous",
                UserRole = user.FindFirst(ClaimTypes.Role)?.Value ?? "Unknown",
                Action = $"{context.HttpContext.Request.Method} {context.ActionDescriptor.DisplayName}",
                EntityName = context.RouteData.Values["controller"]?.ToString() ?? "Unknown",
                EntityId = context.RouteData.Values["id"]?.ToString() ?? string.Empty,
                Status = executedContext.Exception == null ? "Success" : "Failed",
                IpAddress = context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? string.Empty,
                CorrelationId = context.HttpContext.TraceIdentifier,
                Details = context.HttpContext.Request.Path
            };

            await _auditService.LogAsync(auditLog);
        }
    }
}