namespace TodoList.Api.Repositories;

internal static class AuditSqlQueries
{
    public const string Insert = """
        INSERT INTO AuditEvents (
            ActorUserId, ActorRole, ActorFullName, Action, EntityType, EntityId,
            ProjectId, ProjectName, TargetUserId, Summary, Metadata, CreatedAt
        )
        VALUES (
            @ActorUserId, @ActorRole, @ActorFullName, @Action, @EntityType, @EntityId,
            @ProjectId, @ProjectName, @TargetUserId, @Summary, @Metadata, @CreatedAt
        );

        SELECT Id, ActorUserId, ActorRole, ActorFullName, Action, EntityType, EntityId,
               ProjectId, ProjectName, TargetUserId, Summary, Metadata, CreatedAt
        FROM AuditEvents
        WHERE Id = LAST_INSERT_ID();
        """;

    public const string SelectList = """
        SELECT Id, ActorUserId, ActorRole, ActorFullName, Action, EntityType, EntityId,
               ProjectId, ProjectName, TargetUserId, Summary, Metadata, CreatedAt
        FROM AuditEvents
        WHERE (@Search IS NULL OR @Search = ''
               OR Summary LIKE CONCAT('%', @Search, '%')
               OR ActorFullName LIKE CONCAT('%', @Search, '%')
               OR ProjectName LIKE CONCAT('%', @Search, '%'))
          AND (@Action IS NULL OR @Action = '' OR Action = @Action)
          AND (@ActorRole IS NULL OR ActorRole = @ActorRole)
          AND (@From IS NULL OR CreatedAt >= @From)
          AND (@To IS NULL OR CreatedAt <= @To)
        ORDER BY CreatedAt DESC
        LIMIT @Limit OFFSET @Offset;
        """;

    public const string CountList = """
        SELECT COUNT(*)
        FROM AuditEvents
        WHERE (@Search IS NULL OR @Search = ''
               OR Summary LIKE CONCAT('%', @Search, '%')
               OR ActorFullName LIKE CONCAT('%', @Search, '%')
               OR ProjectName LIKE CONCAT('%', @Search, '%'))
          AND (@Action IS NULL OR @Action = '' OR Action = @Action)
          AND (@ActorRole IS NULL OR ActorRole = @ActorRole)
          AND (@From IS NULL OR CreatedAt >= @From)
          AND (@To IS NULL OR CreatedAt <= @To);
        """;
}
