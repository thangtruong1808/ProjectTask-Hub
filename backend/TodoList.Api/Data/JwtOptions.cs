namespace TodoList.Api.Data;

public class JwtOptions
{
    public string Secret { get; set; } = string.Empty;
    public int AccessExpiresMinutes { get; set; } = 15;
    public int RefreshExpiresDays { get; set; } = 7;
    public int PasswordResetExpiresMinutes { get; set; } = 30;
}
