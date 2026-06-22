using Dapper;
using TodoList.Api.Data;
using TodoList.Api.Models;

namespace TodoList.Api.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(
            new CommandDefinition(UserSqlQueries.SelectByEmail, new { Email = email }, cancellationToken: cancellationToken));
    }

    public async Task<User?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(
            new CommandDefinition(UserSqlQueries.SelectById, new { Id = id }, cancellationToken: cancellationToken));
    }

    public async Task<IReadOnlyList<User>> GetAllActiveAsync(CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var users = await connection.QueryAsync<User>(
            new CommandDefinition(UserSqlQueries.SelectAllActive, cancellationToken: cancellationToken));
        return users.AsList();
    }

    public async Task<IReadOnlyList<User>> SearchAssignableActiveAsync(
        IReadOnlyList<UserRole> roles,
        string? search,
        int limit,
        CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var users = await connection.QueryAsync<User>(
            new CommandDefinition(
                UserSqlQueries.SearchAssignableActive,
                new
                {
                    Roles = roles.Select(role => (int)role).ToArray(),
                    Search = string.IsNullOrWhiteSpace(search) ? null : search.Trim(),
                    Limit = Math.Clamp(limit, 1, 50),
                },
                cancellationToken: cancellationToken));
        return users.AsList();
    }

    public async Task<User> CreateAsync(User user, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleAsync<User>(
            new CommandDefinition(UserSqlQueries.Insert, new
            {
                user.Email,
                user.PasswordHash,
                user.FirstName,
                user.LastName,
                user.Phone,
                Role = (int)user.Role,
                IsActive = user.IsActive,
                user.CreatedAt,
                user.UpdatedAt
            }, cancellationToken: cancellationToken));
    }

    public async Task<bool> UpdateProfileAsync(User user, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(
            new CommandDefinition(UserSqlQueries.UpdateProfile, new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Phone,
                user.UpdatedAt
            }, cancellationToken: cancellationToken));
        return rows > 0;
    }

    public async Task<bool> UpdatePasswordAsync(long id, string passwordHash, DateTime updatedAt, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(
            new CommandDefinition(UserSqlQueries.UpdatePassword, new { Id = id, PasswordHash = passwordHash, UpdatedAt = updatedAt }, cancellationToken: cancellationToken));
        return rows > 0;
    }

    public async Task<bool> UpdateRoleAsync(long id, UserRole role, DateTime updatedAt, CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(
            new CommandDefinition(
                UserSqlQueries.UpdateRole,
                new { Id = id, Role = (int)role, UpdatedAt = updatedAt },
                cancellationToken: cancellationToken));
        return rows > 0;
    }

    public async Task<int> CountActiveAsync(CancellationToken cancellationToken = default)
    {
        await using var connection = _connectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(
            new CommandDefinition(UserSqlQueries.CountAll, cancellationToken: cancellationToken));
    }
}
