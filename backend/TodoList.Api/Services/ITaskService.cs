using TodoList.Api.Models;

namespace TodoList.Api.Services;

public interface ITaskService
{
    Task<IReadOnlyList<TaskItem>> GetAllAsync(TaskQueryParams query, CancellationToken cancellationToken = default);
    Task<TaskItem?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<TaskItem> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(long id, UpdateTaskRequest request, CancellationToken cancellationToken = default);
    Task<bool> UpdateStatusAsync(long id, UpdateTaskStatusRequest request, CancellationToken cancellationToken = default);
    Task<bool> AssignAsync(long id, AssignTaskRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
