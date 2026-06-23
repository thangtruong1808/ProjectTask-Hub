using TodoList.Api.Models;

namespace TodoList.Api.Repositories;

public interface IAuditRepository
{
    Task<AuditEventItem> CreateAsync(AuditWriteRequest request, DateTime createdAt, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AuditEventItem>> GetListAsync(AuditEventQuery query, CancellationToken cancellationToken = default);
    Task<int> CountAsync(AuditEventQuery query, CancellationToken cancellationToken = default);
}
