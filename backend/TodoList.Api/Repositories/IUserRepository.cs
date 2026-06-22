using TodoList.Api.Models;

namespace TodoList.Api.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<User>> GetAllActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<User>> SearchAssignableActiveAsync(
        IReadOnlyList<UserRole> roles,
        string? search,
        int limit,
        CancellationToken cancellationToken = default);
    Task<User> CreateAsync(User user, CancellationToken cancellationToken = default);
    Task<bool> UpdateProfileAsync(User user, CancellationToken cancellationToken = default);
    Task<bool> UpdatePasswordAsync(long id, string passwordHash, DateTime updatedAt, CancellationToken cancellationToken = default);
    Task<bool> UpdateRoleAsync(long id, UserRole role, DateTime updatedAt, CancellationToken cancellationToken = default);
    Task<int> CountActiveAsync(CancellationToken cancellationToken = default);
}
