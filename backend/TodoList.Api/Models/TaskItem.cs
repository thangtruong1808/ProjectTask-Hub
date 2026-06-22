namespace TodoList.Api.Models;

public class TaskItem
{
    public long Id { get; set; }
    public long ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.Pending;
    public long? AssignedToUserId { get; set; }
    public long? AssignedByUserId { get; set; }
    public DateTime? AssignedAt { get; set; }
}
