using TodoList.Api.Infrastructure;
using TodoList.Api.Models;
using TodoList.Api.Repositories;

namespace TodoList.Api.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ICurrentUserService _currentUser;

    public NotificationService(INotificationRepository notificationRepository, ICurrentUserService currentUser)
    {
        _notificationRepository = notificationRepository;
        _currentUser = currentUser;
    }

    public async Task<NotificationListResponse> GetNotificationsAsync(int limit, int offset, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.UserId.HasValue)
        {
            return new NotificationListResponse();
        }

        var userId = _currentUser.UserId.Value;
        var items = await _notificationRepository.GetByUserAsync(userId, limit, offset, cancellationToken);
        var unread = await _notificationRepository.CountUnreadAsync(userId, cancellationToken);

        return new NotificationListResponse { Items = items, UnreadCount = unread };
    }

    public async Task<bool> MarkReadAsync(long id, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.UserId.HasValue) return false;
        return await _notificationRepository.MarkReadAsync(id, _currentUser.UserId.Value, cancellationToken);
    }

    public async Task<bool> MarkAllReadAsync(CancellationToken cancellationToken = default)
    {
        if (!_currentUser.UserId.HasValue) return false;
        return await _notificationRepository.MarkAllReadAsync(_currentUser.UserId.Value, cancellationToken);
    }
}
