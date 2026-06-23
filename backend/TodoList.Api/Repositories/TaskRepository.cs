using Dapper;
using TodoList.Api.Data;
using TodoList.Api.Models;

namespace TodoList.Api.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<TaskRepository> _logger;

    public TaskRepository(IDbConnectionFactory connectionFactory, ILogger<TaskRepository> logger)
    {
        _connectionFactory = connectionFactory;
        _logger = logger;
    }

    public async Task<IReadOnlyList<TaskItem>> GetAllForAdminAsync(string? search, int? status, long? projectId, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var tasks = await connection.QueryAsync<TaskItem>(
            new CommandDefinition(
                TaskSqlQueries.SelectAllAdmin,
                new { Search = search, Status = status, ProjectId = projectId is > 0 ? projectId.Value : 0L },
                cancellationToken: cancellationToken));
        return tasks.AsList();
    }

    public async Task<IReadOnlyList<TaskItem>> GetAllForProjectManagerAsync(long userId, string? search, int? status, long? projectId, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var tasks = await connection.QueryAsync<TaskItem>(
            new CommandDefinition(
                TaskSqlQueries.SelectAllForProjectManager,
                new { UserId = userId, Search = search, Status = status, ProjectId = projectId is > 0 ? projectId.Value : 0L },
                cancellationToken: cancellationToken));
        return tasks.AsList();
    }

    public async Task<IReadOnlyList<TaskItem>> GetAllForUserAsync(long userId, string? search, int? status, long? projectId, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var tasks = await connection.QueryAsync<TaskItem>(
            new CommandDefinition(
                TaskSqlQueries.SelectAllForUser,
                new { UserId = userId, Search = search, Status = status, ProjectId = projectId is > 0 ? projectId.Value : 0L },
                cancellationToken: cancellationToken));
        return tasks.AsList();
    }

    public async Task<TaskItem?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<TaskItem>(
            new CommandDefinition(TaskSqlQueries.SelectById, new { Id = id }, cancellationToken: cancellationToken));
    }

    public async Task<TaskItem> CreateAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleAsync<TaskItem>(
            new CommandDefinition(TaskSqlQueries.Insert, new
            {
                task.ProjectId,
                task.Name,
                task.Description,
                task.CreatedAt,
                task.UpdatedAt,
                Status = (int)task.Status,
                task.AssignedToUserId,
                task.AssignedByUserId,
                task.AssignedAt
            }, cancellationToken: cancellationToken));
    }

    public async Task<bool> UpdateAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(
            new CommandDefinition(TaskSqlQueries.Update, new
            {
                task.Id,
                task.Name,
                task.Description,
                Status = (int)task.Status,
                task.UpdatedAt
            }, cancellationToken: cancellationToken));
        return rows > 0;
    }

    public async Task<bool> UpdateStatusAsync(long id, Models.TaskStatus status, DateTime updatedAt, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(
            new CommandDefinition(TaskSqlQueries.UpdateStatus, new { Id = id, Status = (int)status, UpdatedAt = updatedAt }, cancellationToken: cancellationToken));
        return rows > 0;
    }

    public async Task<bool> AssignAsync(long id, long assignedToUserId, long assignedByUserId, DateTime assignedAt, DateTime updatedAt, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(
            new CommandDefinition(TaskSqlQueries.Assign, new
            {
                Id = id,
                AssignedToUserId = assignedToUserId,
                AssignedByUserId = assignedByUserId,
                AssignedAt = assignedAt,
                UpdatedAt = updatedAt
            }, cancellationToken: cancellationToken));
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(
            new CommandDefinition(TaskSqlQueries.Delete, new { Id = id }, cancellationToken: cancellationToken));
        return rows > 0;
    }

    public async Task<(int Total, int Pending, int InProgress, int Completed, int Cancelled)> GetStatusCountsAsync(CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var row = await connection.QuerySingleAsync<dynamic>(
            new CommandDefinition(TaskSqlQueries.CountByStatus, cancellationToken: cancellationToken));
        return ((int)row.Total, (int)row.Pending, (int)row.InProgress, (int)row.Completed, (int)row.Cancelled);
    }

    public async Task<IReadOnlyList<ProjectProgressItem>> GetProjectProgressAsync(CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var items = await connection.QueryAsync<ProjectProgressItem>(
            new CommandDefinition(TaskSqlQueries.SelectProjectProgress, cancellationToken: cancellationToken));
        return items.AsList();
    }

    public async Task<ProjectProgressItem?> GetProjectProgressByIdAsync(long projectId, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<ProjectProgressItem>(
            new CommandDefinition(
                TaskSqlQueries.SelectProjectProgressById,
                new { ProjectId = projectId },
                cancellationToken: cancellationToken));
    }
}
