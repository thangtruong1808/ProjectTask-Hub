using TodoList.Api.Infrastructure;
using TodoList.Api.Models;
using TodoList.Api.Repositories;

namespace TodoList.Api.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUser;

    public UserService(IUserRepository userRepository, ICurrentUserService currentUser)
    {
        _userRepository = userRepository;
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
        if (!_currentUser.IsAdmin) return [];
        var users = await _userRepository.GetAllActiveAsync(cancellationToken);
        return users.Where(u => u.Role == UserRole.User).Select(AuthService.MapUser).ToList();
    }
}
