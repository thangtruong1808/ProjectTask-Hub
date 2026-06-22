namespace TodoList.Api.Repositories;

public interface IAuthRepository
{
    Task StoreRefreshTokenAsync(long userId, string tokenHash, DateTime expiresAt, CancellationToken cancellationToken = default);
    Task<(long UserId, DateTime ExpiresAt, DateTime? RevokedAt)?> GetRefreshTokenAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task RevokeRefreshTokenAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task StorePasswordResetTokenAsync(long userId, string tokenHash, DateTime expiresAt, CancellationToken cancellationToken = default);
    Task<(long UserId, DateTime ExpiresAt, DateTime? UsedAt)?> GetPasswordResetTokenAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task MarkPasswordResetTokenUsedAsync(string tokenHash, CancellationToken cancellationToken = default);
}
