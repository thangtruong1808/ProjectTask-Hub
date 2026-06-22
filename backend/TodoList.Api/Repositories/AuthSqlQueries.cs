namespace TodoList.Api.Repositories;

internal static class AuthSqlQueries
{
    public const string InsertRefreshToken = """
        INSERT INTO RefreshTokens (UserId, TokenHash, ExpiresAt, CreatedAt)
        VALUES (@UserId, @TokenHash, @ExpiresAt, @CreatedAt);
        """;

    public const string SelectRefreshToken = """
        SELECT Id, UserId, TokenHash, ExpiresAt, CreatedAt, RevokedAt
        FROM RefreshTokens
        WHERE TokenHash = @TokenHash
        LIMIT 1;
        """;

    public const string RevokeRefreshToken = """
        UPDATE RefreshTokens SET RevokedAt = @RevokedAt WHERE TokenHash = @TokenHash;
        """;

    public const string InsertPasswordResetToken = """
        INSERT INTO PasswordResetTokens (UserId, TokenHash, ExpiresAt, CreatedAt)
        VALUES (@UserId, @TokenHash, @ExpiresAt, @CreatedAt);
        """;

    public const string SelectPasswordResetToken = """
        SELECT Id, UserId, TokenHash, ExpiresAt, CreatedAt, UsedAt
        FROM PasswordResetTokens
        WHERE TokenHash = @TokenHash
        LIMIT 1;
        """;

    public const string MarkPasswordResetTokenUsed = """
        UPDATE PasswordResetTokens SET UsedAt = @UsedAt WHERE TokenHash = @TokenHash;
        """;
}
