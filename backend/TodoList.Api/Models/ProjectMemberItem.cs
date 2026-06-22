namespace TodoList.Api.Models;

public class ProjectMemberItem
{
    public long UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
}

public class AssignProjectMemberRequest
{
    public long UserId { get; set; }
}
