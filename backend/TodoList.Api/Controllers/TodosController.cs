using Microsoft.AspNetCore.Mvc;
using TodoList.Api.Models;
using TodoList.Api.Services;

namespace TodoList.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TodosController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly ILogger<TodosController> _logger;

    public TodosController(ITaskService taskService, ILogger<TodosController> logger)
    {
        _taskService = taskService;
        _logger = logger;
    }

    [HttpGet]   // Get all tasks
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTodos(CancellationToken cancellationToken)
    {
        _logger.LogInformation("[Controller] GET /api/todos -> TaskService.GetAllAsync");
        var tasks = await _taskService.GetAllAsync(cancellationToken);
        _logger.LogInformation("[Controller] GET /api/todos completed. Returned {Count} task(s)", tasks.Count);
        return Ok(tasks);
    }

    [HttpGet("{id:long}")]   // Get a task by id
    public async Task<ActionResult<TaskItem>> GetTodo(long id, CancellationToken cancellationToken)
    {
        _logger.LogInformation("[Controller] GET /api/todos/{TaskId} -> TaskService.GetByIdAsync", id);
        var task = await _taskService.GetByIdAsync(id, cancellationToken);

        if (task is null)
        {
            _logger.LogWarning("[Controller] GET /api/todos/{TaskId} -> NotFound", id);
            return NotFound();
        }

        _logger.LogInformation("[Controller] GET /api/todos/{TaskId} completed", id);
        return task;
    }

    [HttpPost]   // Create a new task
    public async Task<ActionResult<TaskItem>> CreateTodo(
        CreateTaskRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "[Controller] POST /api/todos -> TaskService.CreateAsync (Name: {Name}, Status: {Status})",
            request.Name,
            request.Status);

        try
        {
            var task = await _taskService.CreateAsync(request, cancellationToken);
            _logger.LogInformation("[Controller] POST /api/todos completed. Created TaskId: {TaskId}", task.Id);
            return CreatedAtAction(nameof(GetTodo), new { id = task.Id }, task);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("[Controller] POST /api/todos -> BadRequest: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:long}")]   // Update a task
    public async Task<IActionResult> UpdateTodo(
        long id,
        UpdateTaskRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "[Controller] PUT /api/todos/{TaskId} -> TaskService.UpdateAsync (Status: {Status})",
            id,
            request.Status);

        try
        {
            var updated = await _taskService.UpdateAsync(id, request, cancellationToken);
            if (!updated)
            {
                _logger.LogWarning("[Controller] PUT /api/todos/{TaskId} -> NotFound", id);
                return NotFound();
            }

            _logger.LogInformation("[Controller] PUT /api/todos/{TaskId} completed", id);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("[Controller] PUT /api/todos/{TaskId} -> BadRequest: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:long}/status")]   // Update a task status
    public async Task<IActionResult> UpdateTodoStatus(
        long id,
        UpdateTaskStatusRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "[Controller] PATCH /api/todos/{TaskId}/status -> TaskService.UpdateStatusAsync (Status: {Status})",
            id,
            request.Status);

        var updated = await _taskService.UpdateStatusAsync(id, request, cancellationToken);
        if (!updated)
        {
            _logger.LogWarning("[Controller] PATCH /api/todos/{TaskId}/status -> NotFound", id);
            return NotFound();
        }

        _logger.LogInformation("[Controller] PATCH /api/todos/{TaskId}/status completed", id);
        return NoContent();
    }

    [HttpDelete("{id:long}")]   // Delete a task
    public async Task<IActionResult> DeleteTodo(long id, CancellationToken cancellationToken)
    {
        _logger.LogInformation("[Controller] DELETE /api/todos/{TaskId} -> TaskService.DeleteAsync", id);
        var deleted = await _taskService.DeleteAsync(id, cancellationToken);

        if (!deleted)
        {
            _logger.LogWarning("[Controller] DELETE /api/todos/{TaskId} -> NotFound", id);
            return NotFound();
        }

        _logger.LogInformation("[Controller] DELETE /api/todos/{TaskId} completed", id);
        return NoContent();
    }
}
