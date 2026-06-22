using TodoList.Api.Infrastructure;
using TodoList.Api.Models;
using TodoList.Api.Repositories;

namespace TodoList.Api.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUser;

    public ProjectService(
        IProjectRepository projectRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUser)
    {
        _projectRepository = projectRepository;
        _userRepository = userRepository;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<ProjectItem>> GetSelectableAsync(CancellationToken cancellationToken = default)
    {
        if (_currentUser.IsAdmin)
        {
            return await _projectRepository.GetAllActiveAsync(cancellationToken);
        }

        if (!_currentUser.UserId.HasValue)
        {
            return [];
        }

        return await _projectRepository.GetForAssignedUserAsync(_currentUser.UserId.Value, cancellationToken);
    }

    public async Task<IReadOnlyList<ProjectMemberItem>> GetMembersAsync(long projectId, CancellationToken cancellationToken = default)
    {
        EnsureAdmin();
        if (!await _projectRepository.ExistsActiveAsync(projectId, cancellationToken))
        {
            return [];
        }

        return await _projectRepository.GetMembersAsync(projectId, cancellationToken);
    }

    public async Task<bool> AssignMemberAsync(long projectId, long userId, CancellationToken cancellationToken = default)
    {
        EnsureAdmin();
        if (!_currentUser.UserId.HasValue)
        {
            return false;
        }

        if (!await _projectRepository.ExistsActiveAsync(projectId, cancellationToken))
        {
            return false;
        }

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null || !user.IsActive || user.Role != UserRole.User)
        {
            throw new ArgumentException("Invalid user. Only active standard users can be assigned to projects.");
        }

        return await _projectRepository.AddMemberAsync(
            projectId,
            userId,
            _currentUser.UserId.Value,
            DateTime.UtcNow,
            cancellationToken);
    }

    public async Task<bool> RemoveMemberAsync(long projectId, long userId, CancellationToken cancellationToken = default)
    {
        EnsureAdmin();
        if (!await _projectRepository.ExistsActiveAsync(projectId, cancellationToken))
        {
            return false;
        }

        return await _projectRepository.RemoveMemberAsync(projectId, userId, cancellationToken);
    }

    private void EnsureAdmin()
    {
        if (!_currentUser.IsAdmin)
        {
            throw new UnauthorizedAccessException("Only admins can manage project members.");
        }
    }
}
