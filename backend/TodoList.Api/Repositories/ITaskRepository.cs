using TodoList.Api.Models;

namespace TodoList.Api.Repositories;

public interface ITaskRepository
{
    Task<IReadOnlyList<TaskItem>> GetAllForAdminAsync(string? search, int? status, long? projectId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TaskItem>> GetAllForUserAsync(long userId, string? search, int? status, long? projectId, CancellationToken cancellationToken = default);
    Task<TaskItem?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<TaskItem> CreateAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task<bool> UpdateStatusAsync(long id, Models.TaskStatus status, DateTime updatedAt, CancellationToken cancellationToken = default);
    Task<bool> AssignAsync(long id, long assignedToUserId, long assignedByUserId, DateTime assignedAt, DateTime updatedAt, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
    Task<(int Total, int Pending, int InProgress, int Completed, int Cancelled)> GetStatusCountsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TaskItem>> GetRecentAssignmentsAsync(int limit, CancellationToken cancellationToken = default);
}
