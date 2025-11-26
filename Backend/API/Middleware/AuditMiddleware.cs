using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System.Security.Claims;
using System;

namespace API.Middleware
{
 public class AuditMiddleware
 {
 private readonly RequestDelegate _next;
 private readonly ILogger<AuditMiddleware> _logger;
 public AuditMiddleware(RequestDelegate next, ILogger<AuditMiddleware> logger){ _next = next; _logger = logger; }
 public async Task InvokeAsync(HttpContext context)
 {
 var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? context.User.FindFirstValue(ClaimTypes.Name) ?? "anon";
 var path = context.Request.Path;
 var method = context.Request.Method;
 var started = DateTime.UtcNow;
 await _next(context);
 var status = context.Response.StatusCode;
 _logger.LogInformation("AUDIT {User} {Method} {Path} {Status} {Duration}ms", userId, method, path, status, (DateTime.UtcNow-started).TotalMilliseconds);
 }
 }
}
