namespace TodoList.Api.Repositories;

internal static class TaskSqlQueries
{
    public const string SelectAllAdmin = """
        SELECT Id, Name, Description, CreatedAt, UpdatedAt, Status,
               AssignedToUserId, AssignedByUserId, AssignedAt
        FROM Tasks
        WHERE (@Search IS NULL OR @Search = '' OR Name LIKE CONCAT('%', @Search, '%'))
          AND (@Status IS NULL OR Status = @Status)
        ORDER BY UpdatedAt DESC;
        """;

    public const string SelectAllForUser = """
        SELECT Id, Name, Description, CreatedAt, UpdatedAt, Status,
               AssignedToUserId, AssignedByUserId, AssignedAt
        FROM Tasks
        WHERE AssignedToUserId = @UserId
          AND (@Search IS NULL OR @Search = '' OR Name LIKE CONCAT('%', @Search, '%'))
          AND (@Status IS NULL OR Status = @Status)
        ORDER BY UpdatedAt DESC;
        """;

    public const string SelectById = """
        SELECT Id, Name, Description, CreatedAt, UpdatedAt, Status,
               AssignedToUserId, AssignedByUserId, AssignedAt
        FROM Tasks
        WHERE Id = @Id
        LIMIT 1;
        """;

    public const string Insert = """
        INSERT INTO Tasks (Name, Description, CreatedAt, UpdatedAt, Status,
                           AssignedToUserId, AssignedByUserId, AssignedAt)
        VALUES (@Name, @Description, @CreatedAt, @UpdatedAt, @Status,
                @AssignedToUserId, @AssignedByUserId, @AssignedAt);

        SELECT Id, Name, Description, CreatedAt, UpdatedAt, Status,
               AssignedToUserId, AssignedByUserId, AssignedAt
        FROM Tasks WHERE Id = LAST_INSERT_ID();
        """;

    public const string Update = """
        UPDATE Tasks
        SET Name = @Name, Description = @Description, Status = @Status, UpdatedAt = @UpdatedAt
        WHERE Id = @Id;
        """;

    public const string UpdateStatus = """
        UPDATE Tasks SET Status = @Status, UpdatedAt = @UpdatedAt WHERE Id = @Id;
        """;

    public const string Assign = """
        UPDATE Tasks
        SET AssignedToUserId = @AssignedToUserId,
            AssignedByUserId = @AssignedByUserId,
            AssignedAt = @AssignedAt,
            UpdatedAt = @UpdatedAt
        WHERE Id = @Id;
        """;

    public const string Delete = """
        DELETE FROM Tasks WHERE Id = @Id;
        """;

    public const string CountByStatus = """
        SELECT
            COUNT(*) AS Total,
            SUM(Status = 0) AS Pending,
            SUM(Status = 1) AS InProgress,
            SUM(Status = 2) AS Completed,
            SUM(Status = 3) AS Cancelled
        FROM Tasks;
        """;

    public const string SelectRecentAssignments = """
        SELECT Id, Name, Description, CreatedAt, UpdatedAt, Status,
               AssignedToUserId, AssignedByUserId, AssignedAt
        FROM Tasks
        WHERE AssignedAt IS NOT NULL
        ORDER BY AssignedAt DESC
        LIMIT @Limit;
        """;
}
