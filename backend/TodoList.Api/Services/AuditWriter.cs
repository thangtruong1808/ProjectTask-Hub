using TodoList.Api.Infrastructure;
using TodoList.Api.Models;
using TodoList.Api.Repositories;

namespace TodoList.Api.Services;

public class AuditWriter : IAuditWriter
{
    private readonly IAuditRepository _auditRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<AuditWriter> _logger;

    public AuditWriter(
        IAuditRepository auditRepository,
        ICurrentUserService currentUser,
        ILogger<AuditWriter> logger)
    {
        _auditRepository = auditRepository;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task WriteAsync(AuditWriteRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            await _auditRepository.CreateAsync(request, DateTime.UtcNow, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write audit event {Action}", request.Action);
        }
    }

    public async Task WriteForCurrentUserAsync(AuditWriteRequest request, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.UserId.HasValue || !_currentUser.Role.HasValue)
        {
            return;
        }

        request.ActorUserId ??= _currentUser.UserId.Value;
        request.ActorRole = _currentUser.Role.Value;
        if (string.IsNullOrWhiteSpace(request.ActorFullName))
        {
            request.ActorFullName = _currentUser.FullName ?? $"User #{_currentUser.UserId.Value}";
        }

        await WriteAsync(request, cancellationToken);
    }

    public async Task WriteForUserAsync(User user, AuditWriteRequest request, CancellationToken cancellationToken = default)
    {
        request.ActorUserId = user.Id;
        request.ActorRole = user.Role;
        request.ActorFullName = AuditFormatting.FullName(user);
        await WriteAsync(request, cancellationToken);
    }
}
