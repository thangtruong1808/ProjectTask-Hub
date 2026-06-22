namespace TodoList.Api.Repositories;

internal static class ProjectSqlQueries
{
    public const string SelectAllActive = """
        SELECT Id, Name, Code
        FROM Projects
        WHERE IsActive = 1
        ORDER BY Name;
        """;

    public const string SelectForAssignedUser = """
        SELECT DISTINCT p.Id, p.Name, p.Code
        FROM Projects p
        INNER JOIN ProjectMembers pm ON pm.ProjectId = p.Id
        WHERE p.IsActive = 1
          AND pm.UserId = @UserId
        ORDER BY p.Name;
        """;

    public const string SelectMembers = """
        SELECT pm.UserId, u.Email, u.FirstName, u.LastName, pm.AssignedAt
        FROM ProjectMembers pm
        INNER JOIN Users u ON u.Id = pm.UserId
        WHERE pm.ProjectId = @ProjectId
          AND u.IsActive = 1
        ORDER BY u.FirstName, u.LastName;
        """;

    public const string InsertMember = """
        INSERT IGNORE INTO ProjectMembers (ProjectId, UserId, AssignedByUserId, AssignedAt)
        VALUES (@ProjectId, @UserId, @AssignedByUserId, @AssignedAt);
        """;

    public const string DeleteMember = """
        DELETE FROM ProjectMembers
        WHERE ProjectId = @ProjectId AND UserId = @UserId;
        """;

    public const string ExistsActive = """
        SELECT COUNT(*) FROM Projects WHERE Id = @ProjectId AND IsActive = 1;
        """;

    public const string IsMember = """
        SELECT COUNT(*) FROM ProjectMembers WHERE ProjectId = @ProjectId AND UserId = @UserId;
        """;

    public const string SelectProjectManagers = """
        SELECT DISTINCT u.Id, u.Email, u.FirstName, u.LastName
        FROM ProjectMembers pm
        INNER JOIN Users u ON u.Id = pm.UserId
        WHERE pm.ProjectId = @ProjectId
          AND u.Role = 2
          AND u.IsActive = 1
        UNION
        SELECT u.Id, u.Email, u.FirstName, u.LastName
        FROM Users u
        WHERE @AssignedByUserId > 0
          AND u.Id = @AssignedByUserId
          AND u.Role = 2
          AND u.IsActive = 1;
        """;

    public const string SelectAssignableUsers = """
        SELECT u.Id, u.Email, u.FirstName, u.LastName, u.Phone, u.Role
        FROM ProjectMembers pm
        INNER JOIN Users u ON u.Id = pm.UserId
        WHERE pm.ProjectId = @ProjectId
          AND u.Role = 0
          AND u.IsActive = 1
        ORDER BY u.FirstName, u.LastName;
        """;
}
