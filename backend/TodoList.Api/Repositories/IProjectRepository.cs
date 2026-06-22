using TodoList.Api.Models;

namespace TodoList.Api.Repositories;

public interface IProjectRepository
{
    Task<IReadOnlyList<ProjectItem>> GetAllActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProjectItem>> GetForAssignedUserAsync(long userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProjectMemberItem>> GetMembersAsync(long projectId, CancellationToken cancellationToken = default);
    Task<bool> AddMemberAsync(long projectId, long userId, long assignedByUserId, DateTime assignedAt, CancellationToken cancellationToken = default);
    Task<bool> RemoveMemberAsync(long projectId, long userId, CancellationToken cancellationToken = default);
    Task<bool> ExistsActiveAsync(long projectId, CancellationToken cancellationToken = default);
    Task<bool> IsMemberAsync(long projectId, long userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProjectManagerItem>> GetProjectManagersAsync(
        long projectId,
        long? assignedByUserId = null,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserDto>> GetAssignableUsersAsync(long projectId, CancellationToken cancellationToken = default);
}
