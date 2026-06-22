namespace TodoList.Api.Repositories;

internal static class UserSqlQueries
{
    public const string SelectByEmail = """
        SELECT Id, Email, PasswordHash, FirstName, LastName, Phone, Role, IsActive, CreatedAt, UpdatedAt
        FROM Users
        WHERE Email = @Email
        LIMIT 1;
        """;

    public const string SelectById = """
        SELECT Id, Email, PasswordHash, FirstName, LastName, Phone, Role, IsActive, CreatedAt, UpdatedAt
        FROM Users
        WHERE Id = @Id
        LIMIT 1;
        """;

    public const string SelectAllActive = """
        SELECT Id, Email, PasswordHash, FirstName, LastName, Phone, Role, IsActive, CreatedAt, UpdatedAt
        FROM Users
        WHERE IsActive = 1
        ORDER BY FirstName, LastName;
        """;

    public const string Insert = """
        INSERT INTO Users (Email, PasswordHash, FirstName, LastName, Phone, Role, IsActive, CreatedAt, UpdatedAt)
        VALUES (@Email, @PasswordHash, @FirstName, @LastName, @Phone, @Role, @IsActive, @CreatedAt, @UpdatedAt);

        SELECT Id, Email, PasswordHash, FirstName, LastName, Phone, Role, IsActive, CreatedAt, UpdatedAt
        FROM Users WHERE Id = LAST_INSERT_ID();
        """;

    public const string UpdateProfile = """
        UPDATE Users
        SET FirstName = @FirstName, LastName = @LastName, Phone = @Phone, UpdatedAt = @UpdatedAt
        WHERE Id = @Id;
        """;

    public const string UpdatePassword = """
        UPDATE Users
        SET PasswordHash = @PasswordHash, UpdatedAt = @UpdatedAt
        WHERE Id = @Id;
        """;

    public const string CountAll = """
        SELECT COUNT(*) FROM Users WHERE IsActive = 1;
        """;
}
