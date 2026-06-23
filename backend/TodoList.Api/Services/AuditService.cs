using TodoList.Api.Infrastructure;
using TodoList.Api.Models;
using TodoList.Api.Repositories;

namespace TodoList.Api.Services;

public interface IAuditService
{
    Task<AuditEventListResponse> GetEventsAsync(AuditEventQuery query, CancellationToken cancellationToken = default);
}

public class AuditService : IAuditService
{
    private readonly IAuditRepository _auditRepository;
    private readonly ICurrentUserService _currentUser;

    public AuditService(IAuditRepository auditRepository, ICurrentUserService currentUser)
    {
        _auditRepository = auditRepository;
        _currentUser = currentUser;
    }

    public async Task<AuditEventListResponse> GetEventsAsync(
        AuditEventQuery query,
        CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAdmin)
        {
            throw new UnauthorizedAccessException("Only admins can view audit events.");
        }

        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);
        query.Page = page;
        query.PageSize = pageSize;

        var items = await _auditRepository.GetListAsync(query, cancellationToken);
        var total = await _auditRepository.CountAsync(query, cancellationToken);

        return new AuditEventListResponse
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize,
        };
    }
}
