using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TodoList.Api.Data;

public class TodoDbContextFactory : IDesignTimeDbContextFactory<TodoDbContext>
{
    public TodoDbContext CreateDbContext(string[] args)
    {
        DotNetEnv.Env.Load();

        var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING")
            ?? "Server=localhost;Port=3306;Database=todolist;User=root;Password=;";

        var serverVersion = ServerVersion.Parse(
            Environment.GetEnvironmentVariable("MYSQL_SERVER_VERSION") ?? "8.0.36-mysql");

        var optionsBuilder = new DbContextOptionsBuilder<TodoDbContext>();
        optionsBuilder.UseMySql(connectionString, serverVersion);

        return new TodoDbContext(optionsBuilder.Options);
    }
}
