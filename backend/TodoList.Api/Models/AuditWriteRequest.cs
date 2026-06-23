namespace TodoList.Api.Models;

public class AuditWriteRequest
{
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
}
