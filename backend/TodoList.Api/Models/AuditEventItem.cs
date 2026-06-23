namespace TodoList.Api.Models;

public class AuditEventItem
{
    public long Id { get; set; }
    public long? ActorUserId { get; set; }
    public UserRole ActorRole { get; set; }
    public string ActorFullName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public long? EntityId { get; set; }
    public long? ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public long? TargetUserId { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string? Metadata { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AuditEventQuery
{
    public string? Search { get; set; }
    public string? Action { get; set; }
    public UserRole? ActorRole { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class AuditEventListResponse
{
    public IReadOnlyList<AuditEventItem> Items { get; set; } = [];
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class ProjectProgressItem
{
    public long ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string? ProjectCode { get; set; }
    public int Pending { get; set; }
    public int InProgress { get; set; }
    public int Completed { get; set; }
    public int Cancelled { get; set; }
    public int Total { get; set; }
}

public static class AuditActions
{
    public const string TaskCreated = "TaskCreated";
    public const string TaskUpdated = "TaskUpdated";
    public const string TaskDeleted = "TaskDeleted";
    public const string TaskAssigned = "TaskAssigned";
    public const string TaskStatusChanged = "TaskStatusChanged";
    public const string ProjectCreated = "ProjectCreated";
    public const string ProjectUpdated = "ProjectUpdated";
    public const string ProjectDeleted = "ProjectDeleted";
    public const string ProjectMemberAdded = "ProjectMemberAdded";
    public const string ProjectMemberRemoved = "ProjectMemberRemoved";
    public const string UserRoleChanged = "UserRoleChanged";
    public const string UserLoggedIn = "UserLoggedIn";
}

public static class AuditEntityTypes
{
    public const string Task = "Task";
    public const string Project = "Project";
    public const string User = "User";
    public const string Auth = "Auth";
}
