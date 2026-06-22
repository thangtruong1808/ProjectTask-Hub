using System.Security.Claims;
using TodoList.Api.Models;

namespace TodoList.Api.Infrastructure;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public long? UserId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var id) ? id : null;
        }
    }

    public UserRole? Role
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
            return Enum.TryParse<UserRole>(value, out var role) ? role : null;
        }
    }

    public bool IsAuthenticated => UserId.HasValue;

    public bool IsAdmin => Role == UserRole.Admin;

    public bool IsProjectManager => Role == UserRole.ProjectManager;

    public string? FullName
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user is null) return null;
            var first = user.FindFirstValue(ClaimTypes.GivenName)?.Trim();
            var last = user.FindFirstValue(ClaimTypes.Surname)?.Trim();
            var name = $"{first} {last}".Trim();
            return string.IsNullOrWhiteSpace(name) ? null : name;
        }
    }
}
