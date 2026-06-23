using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoList.Api.Models;
using TodoList.Api.Services;

namespace TodoList.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<ActionResult<AuditEventListResponse>> GetEvents(
        [FromQuery] string? search,
        [FromQuery] string? action,
        [FromQuery] UserRole? actorRole,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        return Ok(await _auditService.GetEventsAsync(new AuditEventQuery
        {
            Search = search,
            Action = action,
            ActorRole = actorRole,
            From = from,
            To = to,
            Page = page,
            PageSize = pageSize,
        }, cancellationToken));
    }
}
