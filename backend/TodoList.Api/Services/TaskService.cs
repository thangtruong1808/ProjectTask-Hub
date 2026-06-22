using TodoList.Api.Hubs;
using TodoList.Api.Infrastructure;
using TodoList.Api.Models;
using TodoList.Api.Repositories;
using Microsoft.AspNetCore.SignalR;

namespace TodoList.Api.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IUserRepository _userRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<TaskService> _logger;

    public TaskService(
        ITaskRepository taskRepository,
        IUserRepository userRepository,
        IProjectRepository projectRepository,
        INotificationRepository notificationRepository,
        ICurrentUserService currentUser,
        IHubContext<NotificationHub> hubContext,
        ILogger<TaskService> logger)
    {
        _taskRepository = taskRepository;
        _userRepository = userRepository;
        _projectRepository = projectRepository;
        _notificationRepository = notificationRepository;
        _currentUser = currentUser;
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task<IReadOnlyList<TaskItem>> GetAllAsync(TaskQueryParams query, CancellationToken cancellationToken = default)
    {
        var status = query.Status.HasValue ? (int?)query.Status.Value : null;
        var search = string.IsNullOrWhiteSpace(query.Search) ? null : query.Search.Trim();

        if (_currentUser.IsAdmin)
        {
            return await _taskRepository.GetAllForAdminAsync(search, status, query.ProjectId, cancellationToken);
        }

        if (!_currentUser.UserId.HasValue)
        {
            return [];
        }

        return await _taskRepository.GetAllForUserAsync(_currentUser.UserId.Value, search, status, query.ProjectId, cancellationToken);
    }

    public async Task<TaskItem?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (task is null || CanAccessTask(task))
        {
            return task;
        }

        return null;
    }

    public async Task<TaskItem> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAdmin)
        {
            throw new UnauthorizedAccessException("Only admins can create tasks.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Task name is required.", nameof(request));
        }

        if (request.ProjectId <= 0)
        {
            throw new ArgumentException("Project is required.", nameof(request));
        }

        var now = DateTime.UtcNow;
        var task = new TaskItem
        {
            ProjectId = request.ProjectId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Status = request.Status,
            CreatedAt = now,
            UpdatedAt = now
        };

        return await _taskRepository.CreateAsync(task, cancellationToken);
    }

    public async Task<bool> UpdateAsync(long id, UpdateTaskRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Task name is required.", nameof(request));
        }

        var existing = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (existing is null || !CanAccessTask(existing))
        {
            return false;
        }

        existing.Name = request.Name.Trim();
        existing.Description = request.Description?.Trim();
        existing.Status = request.Status;
        existing.UpdatedAt = DateTime.UtcNow;

        return await _taskRepository.UpdateAsync(existing, cancellationToken);
    }

    public async Task<bool> UpdateStatusAsync(long id, UpdateTaskStatusRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (existing is null || !CanAccessTask(existing))
        {
            return false;
        }

        return await _taskRepository.UpdateStatusAsync(id, request.Status, DateTime.UtcNow, cancellationToken);
    }

    public async Task<bool> AssignAsync(long id, AssignTaskRequest request, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAdmin || !_currentUser.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("Only admins can assign tasks.");
        }

        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (task is null)
        {
            return false;
        }

        var assignee = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (assignee is null || !assignee.IsActive || assignee.Role != UserRole.User)
        {
            throw new ArgumentException("Invalid assignee user.");
        }

        if (!await _projectRepository.IsMemberAsync(task.ProjectId, request.UserId, cancellationToken))
        {
            throw new ArgumentException("User must be assigned to the project before receiving tasks.");
        }

        var now = DateTime.UtcNow;
        var assigned = await _taskRepository.AssignAsync(id, request.UserId, _currentUser.UserId.Value, now, now, cancellationToken);
        if (!assigned)
        {
            return false;
        }

        var projectLabel = FormatProjectLabel(null, task.ProjectName);
        var taskName = task.Name.Trim();

        var notification = await _notificationRepository.CreateAsync(new NotificationItem
        {
            UserId = request.UserId,
            Type = "TaskAssigned",
            Title = taskName,
            Message = $"You have been assigned a task in {projectLabel}.",
            TaskId = id,
            IsRead = false,
            CreatedAt = now
        }, cancellationToken);

        await _hubContext.Clients.User(request.UserId.ToString()).SendAsync("TaskAssigned", new
        {
            notificationId = notification.Id,
            taskId = id,
            taskName,
            title = notification.Title,
            message = notification.Message,
            projectName = notification.ProjectName ?? task.ProjectName,
            projectCode = notification.ProjectCode,
            createdAt = notification.CreatedAt
        }, cancellationToken);

        return true;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAdmin)
        {
            throw new UnauthorizedAccessException("Only admins can delete tasks.");
        }

        var existing = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (existing is null)
        {
            return false;
        }

        return await _taskRepository.DeleteAsync(id, cancellationToken);
    }

    private bool CanAccessTask(TaskItem task)
    {
        if (_currentUser.IsAdmin)
        {
            return true;
        }

        return _currentUser.UserId.HasValue && task.AssignedToUserId == _currentUser.UserId.Value;
    }

    private static string FormatProjectLabel(string? projectCode, string? projectName)
    {
        if (!string.IsNullOrWhiteSpace(projectCode) && !string.IsNullOrWhiteSpace(projectName))
        {
            return $"{projectCode.Trim()} — {projectName.Trim()}";
        }

        if (!string.IsNullOrWhiteSpace(projectName))
        {
            return projectName.Trim();
        }

        if (!string.IsNullOrWhiteSpace(projectCode))
        {
            return projectCode.Trim();
        }

        return "Unknown project";
    }
}
