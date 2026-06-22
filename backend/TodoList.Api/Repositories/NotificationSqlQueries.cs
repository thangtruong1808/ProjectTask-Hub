namespace TodoList.Api.Repositories;

internal static class NotificationSqlQueries
{
    public const string Insert = """
        INSERT INTO Notifications (UserId, Type, Title, Message, TaskId, IsRead, CreatedAt)
        VALUES (@UserId, @Type, @Title, @Message, @TaskId, @IsRead, @CreatedAt);

        SELECT Id, UserId, Type, Title, Message, TaskId, IsRead, CreatedAt
        FROM Notifications WHERE Id = LAST_INSERT_ID();
        """;

    public const string SelectByUser = """
        SELECT Id, UserId, Type, Title, Message, TaskId, IsRead, CreatedAt
        FROM Notifications
        WHERE UserId = @UserId
        ORDER BY CreatedAt DESC
        LIMIT @Limit OFFSET @Offset;
        """;

    public const string CountUnread = """
        SELECT COUNT(*) FROM Notifications WHERE UserId = @UserId AND IsRead = 0;
        """;

    public const string MarkRead = """
        UPDATE Notifications SET IsRead = 1 WHERE Id = @Id AND UserId = @UserId;
        """;

    public const string MarkAllRead = """
        UPDATE Notifications SET IsRead = 1 WHERE UserId = @UserId AND IsRead = 0;
        """;
}
