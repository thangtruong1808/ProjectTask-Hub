using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoList.Api.Models;
using TodoList.Api.Services;

namespace TodoList.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectItem>>> GetProjects(CancellationToken cancellationToken)
    {
        return Ok(await _projectService.GetSelectableAsync(cancellationToken));
    }

    [HttpGet("{id:long}/members")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<ProjectMemberItem>>> GetMembers(long id, CancellationToken cancellationToken)
    {
        var members = await _projectService.GetMembersAsync(id, cancellationToken);
        return Ok(members);
    }

    [HttpPost("{id:long}/members")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignMember(long id, AssignProjectMemberRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var assigned = await _projectService.AssignMemberAsync(id, request.UserId, cancellationToken);
            return assigned ? NoContent() : Conflict(new { message = "User is already assigned to this project." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpGet("{id:long}/assignable-users")]
    [Authorize(Roles = "ProjectManager")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAssignableUsers(long id, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _projectService.GetAssignableUsersForProjectAsync(id, cancellationToken));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpDelete("{id:long}/members/{userId:long}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveMember(long id, long userId, CancellationToken cancellationToken)
    {
        try
        {
            var removed = await _projectService.RemoveMemberAsync(id, userId, cancellationToken);
            return removed ? NoContent() : NotFound();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }
}
