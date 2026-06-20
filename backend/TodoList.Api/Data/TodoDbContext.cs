using Microsoft.EntityFrameworkCore;
using TodoList.Api.Models;

namespace TodoList.Api.Data;

public class TodoDbContext : DbContext
{
    public TodoDbContext(DbContextOptions<TodoDbContext> options) : base(options)
    {
    }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("Tasks");

            entity.Property(t => t.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(t => t.Description)
                .HasColumnType("longtext");

            entity.Property(t => t.Status)
                .HasConversion<int>();

            entity.Property(t => t.CreatedAt)
                .HasColumnType("datetime(6)");

            entity.Property(t => t.UpdatedAt)
                .HasColumnType("datetime(6)");
        });
    }
}
