using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using TodoList.Api.Data;
using TodoList.Api.Repositories;
using TodoList.Api.Services;

// Load environment variables
DotNetEnv.Env.Load();

// Get environment variables
var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING")
    ?? throw new InvalidOperationException("CONNECTION_STRING is not set in .env");

// Get CORS origin
var corsOrigin = Environment.GetEnvironmentVariable("CORS_ORIGIN") ?? "http://localhost:5173";

// Get MySQL server version
var serverVersion = ServerVersion.Parse(
    Environment.GetEnvironmentVariable("MYSQL_SERVER_VERSION") ?? "8.0.36-mysql");

// Create builder
var builder = WebApplication.CreateBuilder(args);

// Add DbContext (used for EF Core migrations only)
builder.Services.AddDbContext<TodoDbContext>(options =>
    options.UseMySql(connectionString, serverVersion));

builder.Services.AddSingleton(new DatabaseOptions
{
    ConnectionString = connectionString
});

// Add repositories
// Add services
builder.Services.AddScoped<IDbConnectionFactory, MySqlConnectionFactory>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ITaskService, TaskService>();

// Add controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Add endpoints explorer and Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Build the application
var app = builder.Build();

// Use Swagger in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS
app.UseCors();

// Use HTTPS redirection
app.UseHttpsRedirection();

// Use authorization
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Run the application
app.Run();
