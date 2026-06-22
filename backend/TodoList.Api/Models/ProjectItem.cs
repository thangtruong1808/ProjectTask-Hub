namespace TodoList.Api.Models;

public class ProjectItem
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
}
