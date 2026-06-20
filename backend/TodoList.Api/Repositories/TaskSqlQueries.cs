namespace TodoList.Api.Repositories;

internal static class TaskSqlQueries
{
    public const string SelectAll = """
        SELECT
            Id,
            Name,
            Description,
            CreatedAt,
            UpdatedAt,
            Status
        FROM Tasks
        ORDER BY UpdatedAt DESC;
        """;

    public const string SelectById = """
        SELECT
            Id,
            Name,
            Description,
            CreatedAt,
            UpdatedAt,
            Status
        FROM Tasks
        WHERE Id = @Id
        LIMIT 1;
        """;

    public const string Insert = """
        INSERT INTO Tasks (Name, Description, CreatedAt, UpdatedAt, Status)
        VALUES (@Name, @Description, @CreatedAt, @UpdatedAt, @Status);

        SELECT
            Id,
            Name,
            Description,
            CreatedAt,
            UpdatedAt,
            Status
        FROM Tasks
        WHERE Id = LAST_INSERT_ID();
        """;

    public const string Update = """
        UPDATE Tasks
        SET
            Name = @Name,
            Description = @Description,
            Status = @Status,
            UpdatedAt = @UpdatedAt
        WHERE Id = @Id;
        """;

    public const string UpdateStatus = """
        UPDATE Tasks
        SET
            Status = @Status,
            UpdatedAt = @UpdatedAt
        WHERE Id = @Id;
        """;

    public const string Delete = """
        DELETE FROM Tasks
        WHERE Id = @Id;
        """;
}
