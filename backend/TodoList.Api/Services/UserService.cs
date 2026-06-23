using TodoList.Api.Infrastructure;
using TodoList.Api.Models;
using TodoList.Api.Repositories;

namespace TodoList.Api.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IAuditWriter _auditWriter;
    private readonly ICurrentUserService _currentUser;

    public UserService(IUserRepository userRepository, IAuditWriter auditWriter, ICurrentUserService currentUser)
    {
        _userRepository = userRepository;
        _auditWriter = auditWriter;
        _currentUser = currentUser;
    }

    public async Task<UserDto?> GetProfileAsync(CancellationToken cancellationToken = default)
    {
        if (!_currentUser.UserId.HasValue) return null;
        var user = await _userRepository.GetByIdAsync(_currentUser.UserId.Value, cancellationToken);
        return user is null ? null : AuthService.MapUser(user);
    }

    public async Task<bool> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.UserId.HasValue) return false;
        var user = await _userRepository.GetByIdAsync(_currentUser.UserId.Value, cancellationToken);
        if (user is null) return false;

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.Phone = request.Phone?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        return await _userRepository.UpdateProfileAsync(user, cancellationToken);
    }

    public async Task<bool> ChangePasswordAsync(ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.UserId.HasValue) return false;
        var user = await _userRepository.GetByIdAsync(_currentUser.UserId.Value, cancellationToken);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
        {
            throw new ArgumentException("New password must be at least 8 characters.");
        }

        return await _userRepository.UpdatePasswordAsync(
            user.Id,
            BCrypt.Net.BCrypt.HashPassword(request.NewPassword),
            DateTime.UtcNow,
            cancellationToken);
    }

    public async Task<IReadOnlyList<UserDto>> GetAssignableUsersAsync(CancellationToken cancellationToken = default)
    {
        return await SearchAssignableUsersAsync(null, 0, cancellationToken);
    }

    public async Task<IReadOnlyList<UserDto>> SearchAssignableUsersAsync(
        string? search,
        int limit,
        CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAdmin && !_currentUser.IsProjectManager)
        {
            return [];
        }

        var roles = _currentUser.IsAdmin
            ? new[] { UserRole.User, UserRole.ProjectManager }
            : new[] { UserRole.User };

        IReadOnlyList<User> users;
        if (string.IsNullOrWhiteSpace(search))
        {
            if (limit > 0)
            {
                users = await _userRepository.SearchAssignableActiveAsync(roles, null, limit, cancellationToken);
            }
            else
            {
                users = await _userRepository.GetAllActiveAsync(cancellationToken);
                users = users.Where(u => roles.Contains(u.Role)).ToList();
            }
        }
        else
        {
            users = await _userRepository.SearchAssignableActiveAsync(
                roles,
                search,
                limit > 0 ? limit : 20,
                cancellationToken);
        }

        return users.Select(AuthService.MapUser).ToList();
    }

    public async Task<IReadOnlyList<UserListItemDto>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAdmin)
        {
            throw new UnauthorizedAccessException("Only admins can list users.");
        }

        var users = await _userRepository.GetAllActiveAsync(cancellationToken);
        return users.Select(MapUserListItem).ToList();
    }

    public async Task<UserDto?> UpdateUserRoleAsync(long id, UserRole role, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAdmin)
        {
            throw new UnauthorizedAccessException("Only admins can update user roles.");
        }

        if (!_currentUser.UserId.HasValue)
        {
            return null;
        }

        if (id == _currentUser.UserId.Value)
        {
            throw new ArgumentException("You cannot change your own role.");
        }

        if (role is not (UserRole.User or UserRole.Admin or UserRole.ProjectManager))
        {
            throw new ArgumentException("Invalid role.");
        }

        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user is null || !user.IsActive)
        {
            return null;
        }

        var updated = await _userRepository.UpdateRoleAsync(id, role, DateTime.UtcNow, cancellationToken);
        if (!updated)
        {
            return null;
        }

        user.Role = role;
        await _auditWriter.WriteForCurrentUserAsync(new AuditWriteRequest
        {
            Action = AuditActions.UserRoleChanged,
            EntityType = AuditEntityTypes.User,
            EntityId = id,
            TargetUserId = id,
            Summary = $"Changed role for {AuditFormatting.FullName(user)} to {role}.",
        }, cancellationToken);
        return AuthService.MapUser(user);
    }

    private static UserListItemDto MapUserListItem(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Phone = user.Phone,
        Role = user.Role,
        CreatedAt = user.CreatedAt
    };
}
