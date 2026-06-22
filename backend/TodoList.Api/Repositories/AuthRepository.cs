using Dapper;
using TodoList.Api.Data;

namespace TodoList.Api.Repositories;

public class AuthRepository : IAuthRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AuthRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task StoreRefreshTokenAsync(long userId, string tokenHash, DateTime expiresAt, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(
            new CommandDefinition(AuthSqlQueries.InsertRefreshToken, new
            {
                UserId = userId,
                TokenHash = tokenHash,
                ExpiresAt = expiresAt,
                CreatedAt = DateTime.UtcNow
            }, cancellationToken: cancellationToken));
    }

    public async Task<(long UserId, DateTime ExpiresAt, DateTime? RevokedAt)?> GetRefreshTokenAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var row = await connection.QuerySingleOrDefaultAsync<dynamic>(
            new CommandDefinition(AuthSqlQueries.SelectRefreshToken, new { TokenHash = tokenHash }, cancellationToken: cancellationToken));
        if (row is null) return null;
        return ((long)row.UserId, (DateTime)row.ExpiresAt, (DateTime?)row.RevokedAt);
    }

    public async Task RevokeRefreshTokenAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(
            new CommandDefinition(AuthSqlQueries.RevokeRefreshToken, new { TokenHash = tokenHash, RevokedAt = DateTime.UtcNow }, cancellationToken: cancellationToken));
    }

    public async Task StorePasswordResetTokenAsync(long userId, string tokenHash, DateTime expiresAt, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(
            new CommandDefinition(AuthSqlQueries.InsertPasswordResetToken, new
            {
                UserId = userId,
                TokenHash = tokenHash,
                ExpiresAt = expiresAt,
                CreatedAt = DateTime.UtcNow
            }, cancellationToken: cancellationToken));
    }

    public async Task<(long UserId, DateTime ExpiresAt, DateTime? UsedAt)?> GetPasswordResetTokenAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var row = await connection.QuerySingleOrDefaultAsync<dynamic>(
            new CommandDefinition(AuthSqlQueries.SelectPasswordResetToken, new { TokenHash = tokenHash }, cancellationToken: cancellationToken));
        if (row is null) return null;
        return ((long)row.UserId, (DateTime)row.ExpiresAt, (DateTime?)row.UsedAt);
    }

    public async Task MarkPasswordResetTokenUsedAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(
            new CommandDefinition(AuthSqlQueries.MarkPasswordResetTokenUsed, new { TokenHash = tokenHash, UsedAt = DateTime.UtcNow }, cancellationToken: cancellationToken));
    }
}
