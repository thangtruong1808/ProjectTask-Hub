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

    public async Task<IReadOnlyList<TaskItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[Repository] Executing SQL: SelectAll");
        await using var connection = _connectionFactory.CreateConnection();
        var tasks = await connection.QueryAsync<TaskItem>(
            new CommandDefinition(TaskSqlQueries.SelectAll, cancellationToken: cancellationToken));

        var result = tasks.AsList();
        _logger.LogInformation("[Repository] SelectAll completed. Rows: {RowCount}", result.Count);
        return result;
    }

    public async Task<TaskItem?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[Repository] Executing SQL: SelectById (@Id: {TaskId})", id);
        await using var connection = _connectionFactory.CreateConnection();
        var task = await connection.QuerySingleOrDefaultAsync<TaskItem>(
            new CommandDefinition(TaskSqlQueries.SelectById, new { Id = id }, cancellationToken: cancellationToken));

        _logger.LogInformation("[Repository] SelectById completed. Found: {Found}", task is not null);
        return task;
    }

    public async Task<TaskItem> CreateAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[Repository] Executing SQL: Insert (@Name: {Name}, @Status: {Status})",
            task.Name,
            task.Status);

        await using var connection = _connectionFactory.CreateConnection();
        var created = await connection.QuerySingleAsync<TaskItem>(
            new CommandDefinition(TaskSqlQueries.Insert, new
            {
                task.Name,
                task.Description,
                task.CreatedAt,
                task.UpdatedAt,
                Status = (int)task.Status
            }, cancellationToken: cancellationToken));

        _logger.LogInformation("[Repository] Insert completed. New TaskId: {TaskId}", created.Id);
        return created;
    }

    public async Task<bool> UpdateAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[Repository] Executing SQL: Update (@Id: {TaskId}, @Status: {Status})",
            task.Id,
            task.Status);

        await using var connection = _connectionFactory.CreateConnection();
        var affectedRows = await connection.ExecuteAsync(
            new CommandDefinition(TaskSqlQueries.Update, new
            {
                task.Id,
                task.Name,
                task.Description,
                Status = (int)task.Status,
                task.UpdatedAt
            }, cancellationToken: cancellationToken));

        _logger.LogInformation("[Repository] Update completed. AffectedRows: {AffectedRows}", affectedRows);
        return affectedRows > 0;
    }

    public async Task<bool> UpdateStatusAsync(
        long id,
        Models.TaskStatus status,
        DateTime updatedAt,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[Repository] Executing SQL: UpdateStatus (@Id: {TaskId}, @Status: {Status})",
            id,
            status);

        await using var connection = _connectionFactory.CreateConnection();
        var affectedRows = await connection.ExecuteAsync(
            new CommandDefinition(TaskSqlQueries.UpdateStatus, new
            {
                Id = id,
                Status = (int)status,
                UpdatedAt = updatedAt
            }, cancellationToken: cancellationToken));

        _logger.LogInformation("[Repository] UpdateStatus completed. AffectedRows: {AffectedRows}", affectedRows);
        return affectedRows > 0;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[Repository] Executing SQL: Delete (@Id: {TaskId})", id);
        await using var connection = _connectionFactory.CreateConnection();
        var affectedRows = await connection.ExecuteAsync(
            new CommandDefinition(TaskSqlQueries.Delete, new { Id = id }, cancellationToken: cancellationToken));

        _logger.LogInformation("[Repository] Delete completed. AffectedRows: {AffectedRows}", affectedRows);
        return affectedRows > 0;
    }
}
