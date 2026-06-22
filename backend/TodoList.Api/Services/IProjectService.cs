using TodoList.Api.Models;

namespace TodoList.Api.Services;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectItem>> GetSelectableAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProjectMemberItem>> GetMembersAsync(long projectId, CancellationToken cancellationToken = default);
    Task<bool> AssignMemberAsync(long projectId, long userId, CancellationToken cancellationToken = default);
    Task<bool> RemoveMemberAsync(long projectId, long userId, CancellationToken cancellationToken = default);
}
