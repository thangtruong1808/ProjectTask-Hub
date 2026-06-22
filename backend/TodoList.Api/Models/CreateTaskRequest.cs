namespace TodoList.Api.Models;

public class CreateTaskRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.Pending;
    public long ProjectId { get; set; }
}
