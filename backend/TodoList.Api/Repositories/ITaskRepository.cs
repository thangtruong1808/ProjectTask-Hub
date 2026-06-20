using TodoList.Api.Models;

namespace TodoList.Api.Repositories;

public interface ITaskRepository
{
    // Get all tasks
    Task<IReadOnlyList<TaskItem>> GetAllAsync(CancellationToken cancellationToken = default);
    // Get a task by id
    Task<TaskItem?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    // Create a new task
    Task<TaskItem> CreateAsync(TaskItem task, CancellationToken cancellationToken = default);
    // Update a task
    Task<bool> UpdateAsync(TaskItem task, CancellationToken cancellationToken = default);
    // Update a task status
    Task<bool> UpdateStatusAsync(long id, Models.TaskStatus status, DateTime updatedAt, CancellationToken cancellationToken = default);
    // Delete a task
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
