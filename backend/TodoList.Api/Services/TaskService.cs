using TodoList.Api.Models;
using TodoList.Api.Repositories;

namespace TodoList.Api.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly ILogger<TaskService> _logger;

    public TaskService(ITaskRepository taskRepository, ILogger<TaskService> logger)
    {
        _taskRepository = taskRepository;
        _logger = logger;
    }
    // Get all tasks
    public async Task<IReadOnlyList<TaskItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[Service] GetAllAsync -> TaskRepository.GetAllAsync");
        var tasks = await _taskRepository.GetAllAsync(cancellationToken);
        _logger.LogInformation("[Service] GetAllAsync completed. Count: {Count}", tasks.Count);
        return tasks;
    }

    // Get a task by id
    public async Task<TaskItem?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[Service] GetByIdAsync({TaskId}) -> TaskRepository.GetByIdAsync", id);
        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        _logger.LogInformation(
            "[Service] GetByIdAsync({TaskId}) completed. Found: {Found}",
            id,
            task is not null);
        return task;
    }

    // Create a new task
    public async Task<TaskItem> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            _logger.LogWarning("[Service] CreateAsync rejected: task name is required");
            throw new ArgumentException("Task name is required.", nameof(request));
        }

        var now = DateTime.UtcNow;

        var task = new TaskItem
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Status = request.Status,
            CreatedAt = now,
            UpdatedAt = now
        };

        _logger.LogInformation(
            "[Service] CreateAsync -> TaskRepository.CreateAsync (Name: {Name}, Status: {Status})",
            task.Name,
            task.Status);

        var created = await _taskRepository.CreateAsync(task, cancellationToken);
        _logger.LogInformation("[Service] CreateAsync completed. TaskId: {TaskId}", created.Id);
        return created;
    }
    
    // Update a task
    public async Task<bool> UpdateAsync(long id, UpdateTaskRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            _logger.LogWarning("[Service] UpdateAsync({TaskId}) rejected: task name is required", id);
            throw new ArgumentException("Task name is required.", nameof(request));
        }

        _logger.LogInformation("[Service] UpdateAsync({TaskId}) -> TaskRepository.GetByIdAsync", id);
        var existingTask = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (existingTask is null)
        {
            _logger.LogWarning("[Service] UpdateAsync({TaskId}) -> task not found", id);
            return false;
        }

        existingTask.Name = request.Name.Trim();
        existingTask.Description = request.Description?.Trim();
        existingTask.Status = request.Status;
        existingTask.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation("[Service] UpdateAsync({TaskId}) -> TaskRepository.UpdateAsync", id);
        var updated = await _taskRepository.UpdateAsync(existingTask, cancellationToken);
        _logger.LogInformation("[Service] UpdateAsync({TaskId}) completed. Updated: {Updated}", id, updated);
        return updated;
    }

    // Update a task status
    public async Task<bool> UpdateStatusAsync(
        long id,
        UpdateTaskStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[Service] UpdateStatusAsync({TaskId}, Status: {Status}) -> TaskRepository.UpdateStatusAsync",
            id,
            request.Status);

        var updated = await _taskRepository.UpdateStatusAsync(id, request.Status, DateTime.UtcNow, cancellationToken);
        _logger.LogInformation("[Service] UpdateStatusAsync({TaskId}) completed. Updated: {Updated}", id, updated);
        return updated;
    }

    // Delete a task
    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[Service] DeleteAsync({TaskId}) -> TaskRepository.DeleteAsync", id);
        var deleted = await _taskRepository.DeleteAsync(id, cancellationToken);
        _logger.LogInformation("[Service] DeleteAsync({TaskId}) completed. Deleted: {Deleted}", id, deleted);
        return deleted;
    }
}
