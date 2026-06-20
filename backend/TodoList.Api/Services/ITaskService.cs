using TodoList.Api.Models;

namespace TodoList.Api.Services;

public interface ITaskService
{
    // Get all tasks    
    Task<IReadOnlyList<TaskItem>> GetAllAsync(CancellationToken cancellationToken = default);
    // Get a task by id
    Task<TaskItem?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    // Create a new task
    Task<TaskItem> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default);
    // Update a task
    Task<bool> UpdateAsync(long id, UpdateTaskRequest request, CancellationToken cancellationToken = default);
    // Update a task status
    Task<bool> UpdateStatusAsync(long id, UpdateTaskStatusRequest request, CancellationToken cancellationToken = default);
    // Delete a task
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
