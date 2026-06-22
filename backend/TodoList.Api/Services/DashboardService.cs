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
        if (!_currentUser.IsAdmin)
        {
            throw new UnauthorizedAccessException("Only admins can access the dashboard.");
        }

        var counts = await _taskRepository.GetStatusCountsAsync(cancellationToken);
        var users = await _userRepository.CountActiveAsync(cancellationToken);
        var recent = await _taskRepository.GetRecentAssignmentsAsync(10, cancellationToken);

        return new DashboardStats
        {
            TotalTasks = counts.Total,
            TotalUsers = users,
            PendingTasks = counts.Pending,
            InProgressTasks = counts.InProgress,
            CompletedTasks = counts.Completed,
            CancelledTasks = counts.Cancelled,
            RecentAssignments = recent
        };
    }
}
