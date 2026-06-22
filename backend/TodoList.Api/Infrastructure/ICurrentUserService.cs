using TodoList.Api.Models;

namespace TodoList.Api.Infrastructure;

public interface ICurrentUserService
{
    long? UserId { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
    bool IsAdmin { get; }
    bool IsProjectManager { get; }
    string? FullName { get; }
}
