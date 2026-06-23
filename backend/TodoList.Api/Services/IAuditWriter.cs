using TodoList.Api.Infrastructure;
using TodoList.Api.Models;

namespace TodoList.Api.Services;

public interface IAuditWriter
{
    Task WriteAsync(AuditWriteRequest request, CancellationToken cancellationToken = default);
    Task WriteForCurrentUserAsync(AuditWriteRequest request, CancellationToken cancellationToken = default);
    Task WriteForUserAsync(User user, AuditWriteRequest request, CancellationToken cancellationToken = default);
}

public static class AuditFormatting
{
    public static string FullName(User user) =>
        $"{user.FirstName} {user.LastName}".Trim();

    public static string FullName(string? firstName, string? lastName) =>
        $"{firstName} {lastName}".Trim();

    public static string ProjectLabel(string? code, string name)
    {
        var trimmed = name.Trim();
        return string.IsNullOrWhiteSpace(code) ? trimmed : $"{code.Trim()} — {trimmed}";
    }
}
