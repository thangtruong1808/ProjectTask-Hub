namespace TodoList.Api.Repositories;

internal static class TaskSqlQueries
{
    private const string SelectColumns = """
        t.Id, t.ProjectId, p.Name AS ProjectName, t.Name, t.Description, t.CreatedAt, t.UpdatedAt, t.Status,
        t.AssignedToUserId, t.AssignedByUserId, t.AssignedAt
        """;

    private const string FromJoin = """
        FROM Tasks t
        INNER JOIN Projects p ON p.Id = t.ProjectId
        """;

    public static readonly string SelectAllAdmin = $"""
        SELECT {SelectColumns}
        {FromJoin}
        WHERE (@Search IS NULL OR @Search = '' OR t.Name LIKE CONCAT('%', @Search, '%'))
          AND (@Status IS NULL OR t.Status = @Status)
          AND (@ProjectId = 0 OR t.ProjectId = @ProjectId)
        ORDER BY t.UpdatedAt DESC;
        """;

    public static readonly string SelectAllForProjectManager = $"""
        SELECT {SelectColumns}
        {FromJoin}
        INNER JOIN ProjectMembers pm ON pm.ProjectId = t.ProjectId AND pm.UserId = @UserId
        WHERE (@Search IS NULL OR @Search = '' OR t.Name LIKE CONCAT('%', @Search, '%'))
          AND (@Status IS NULL OR t.Status = @Status)
          AND (@ProjectId = 0 OR t.ProjectId = @ProjectId)
        ORDER BY t.UpdatedAt DESC;
        """;

    public static readonly string SelectAllForUser = $"""
        SELECT {SelectColumns}
        {FromJoin}
        INNER JOIN ProjectMembers pm ON pm.ProjectId = t.ProjectId AND pm.UserId = @UserId
        WHERE t.AssignedToUserId = @UserId
          AND (@Search IS NULL OR @Search = '' OR t.Name LIKE CONCAT('%', @Search, '%'))
          AND (@Status IS NULL OR t.Status = @Status)
          AND (@ProjectId = 0 OR t.ProjectId = @ProjectId)
        ORDER BY t.UpdatedAt DESC;
        """;

    public static readonly string SelectById = $"""
        SELECT {SelectColumns}
        {FromJoin}
        WHERE t.Id = @Id
        LIMIT 1;
        """;

    public const string Insert = """
        INSERT INTO Tasks (ProjectId, Name, Description, CreatedAt, UpdatedAt, Status,
                           AssignedToUserId, AssignedByUserId, AssignedAt)
        VALUES (@ProjectId, @Name, @Description, @CreatedAt, @UpdatedAt, @Status,
                @AssignedToUserId, @AssignedByUserId, @AssignedAt);

        SELECT t.Id, t.ProjectId, p.Name AS ProjectName, t.Name, t.Description, t.CreatedAt, t.UpdatedAt, t.Status,
               t.AssignedToUserId, t.AssignedByUserId, t.AssignedAt
        FROM Tasks t
        INNER JOIN Projects p ON p.Id = t.ProjectId
        WHERE t.Id = LAST_INSERT_ID();
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

    public const string SelectProjectProgress = """
        SELECT
            p.Id AS ProjectId,
            p.Name AS ProjectName,
            p.Code AS ProjectCode,
            COALESCE(SUM(t.Status = 0), 0) AS Pending,
            COALESCE(SUM(t.Status = 1), 0) AS InProgress,
            COALESCE(SUM(t.Status = 2), 0) AS Completed,
            COALESCE(SUM(t.Status = 3), 0) AS Cancelled,
            COUNT(t.Id) AS Total
        FROM Projects p
        LEFT JOIN Tasks t ON t.ProjectId = p.Id
        WHERE p.IsActive = 1
        GROUP BY p.Id, p.Name, p.Code
        ORDER BY p.Name;
        """;

    public const string SelectProjectProgressById = """
        SELECT
            p.Id AS ProjectId,
            p.Name AS ProjectName,
            p.Code AS ProjectCode,
            COALESCE(SUM(t.Status = 0), 0) AS Pending,
            COALESCE(SUM(t.Status = 1), 0) AS InProgress,
            COALESCE(SUM(t.Status = 2), 0) AS Completed,
            COALESCE(SUM(t.Status = 3), 0) AS Cancelled,
            COUNT(t.Id) AS Total
        FROM Projects p
        LEFT JOIN Tasks t ON t.ProjectId = p.Id
        WHERE p.IsActive = 1 AND p.Id = @ProjectId
        GROUP BY p.Id, p.Name, p.Code
        LIMIT 1;
        """;
}
