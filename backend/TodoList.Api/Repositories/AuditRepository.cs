using Dapper;
using TodoList.Api.Data;
using TodoList.Api.Models;

namespace TodoList.Api.Repositories;

public class AuditRepository : IAuditRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AuditRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<AuditEventItem> CreateAsync(
        AuditWriteRequest request,
        DateTime createdAt,
        CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleAsync<AuditEventItem>(
            new CommandDefinition(
                AuditSqlQueries.Insert,
                new
                {
                    request.ActorUserId,
                    ActorRole = (int)request.ActorRole,
                    request.ActorFullName,
                    request.Action,
                    request.EntityType,
                    request.EntityId,
                    request.ProjectId,
                    request.ProjectName,
                    request.TargetUserId,
                    request.Summary,
                    request.Metadata,
                    CreatedAt = createdAt,
                },
                cancellationToken: cancellationToken));
    }

    public async Task<IReadOnlyList<AuditEventItem>> GetListAsync(
        AuditEventQuery query,
        CancellationToken cancellationToken = default)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);
        var offset = (page - 1) * pageSize;

        await using var connection = _connectionFactory.CreateConnection();
        var items = await connection.QueryAsync<AuditEventItem>(
            new CommandDefinition(
                AuditSqlQueries.SelectList,
                BuildFilterParams(query, pageSize, offset),
                cancellationToken: cancellationToken));
        return items.AsList();
    }

    public async Task<int> CountAsync(AuditEventQuery query, CancellationToken cancellationToken = default)
    {
        var pageSize = Math.Clamp(query.PageSize, 1, 100);
        await using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(
            new CommandDefinition(
                AuditSqlQueries.CountList,
                BuildFilterParams(query, pageSize, 0),
                cancellationToken: cancellationToken));
    }

    private static object BuildFilterParams(AuditEventQuery query, int limit, int offset)
    {
        var search = string.IsNullOrWhiteSpace(query.Search) ? null : query.Search.Trim();
        var action = string.IsNullOrWhiteSpace(query.Action) ? null : query.Action.Trim();

        return new
        {
            Search = search,
            Action = action,
            ActorRole = query.ActorRole.HasValue ? (int?)query.ActorRole.Value : null,
            query.From,
            query.To,
            Limit = limit,
            Offset = offset,
        };
    }
}
