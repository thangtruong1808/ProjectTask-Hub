using MySqlConnector;
using TodoList.Api.Data;

namespace TodoList.Api.Data;

public interface IDbConnectionFactory
{
    MySqlConnection CreateConnection();
}

public class MySqlConnectionFactory : IDbConnectionFactory
{
    private readonly DatabaseOptions _databaseOptions;

    public MySqlConnectionFactory(DatabaseOptions databaseOptions)
    {
        _databaseOptions = databaseOptions;
    }

    public MySqlConnection CreateConnection()
    {
        return new MySqlConnection(_databaseOptions.ConnectionString);
    }
}
