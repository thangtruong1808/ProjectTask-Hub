using TodoList.Api.Infrastructure;
using TodoList.Api.Models;
using TodoList.Api.Repositories;

namespace TodoList.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUser;

    public DashboardService(ITaskRepository taskRepository, IUserRepository userRepository, ICurrentUserService currentUser)
    {
        _taskRepository = taskRepository;
        _userRepository = userRepository;
        _currentUser = currentUser;
    }

    public async Task<DashboardStats> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        EnsureAdmin();

        var counts = await _taskRepository.GetStatusCountsAsync(cancellationToken);
        var users = await _userRepository.CountActiveAsync(cancellationToken);

        return new DashboardStats
        {
            TotalTasks = counts.Total,
            TotalUsers = users,
            PendingTasks = counts.Pending,
            InProgressTasks = counts.InProgress,
            CompletedTasks = counts.Completed,
            CancelledTasks = counts.Cancelled,
        };
    }

    public async Task<IReadOnlyList<ProjectProgressItem>> GetProjectProgressAsync(CancellationToken cancellationToken = default)
    {
        EnsureAdmin();
        return await _taskRepository.GetProjectProgressAsync(cancellationToken);
    }

    public async Task<ProjectProgressItem?> GetProjectProgressByIdAsync(long projectId, CancellationToken cancellationToken = default)
    {
        EnsureAdmin();
        return await _taskRepository.GetProjectProgressByIdAsync(projectId, cancellationToken);
    }

    private void EnsureAdmin()
    {
        if (!_currentUser.IsAdmin)
        {
            throw new UnauthorizedAccessException("Only admins can access the dashboard.");
        }
    }
}
