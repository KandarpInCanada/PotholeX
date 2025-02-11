using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PotholeBackendApp.domain.entities;
using PotholeBackendApp.infrastructure.configuration;

namespace PotholeBackendApp.infrastructure.repository;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task AddUserAsync(User user);
}

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _usersCollection;

    public UserRepository(IOptions<MongoDbSettings> mongoSettings)
    {
        var mongoClient = new MongoClient(mongoSettings.Value.ConnectionString);
        var database = mongoClient.GetDatabase(mongoSettings.Value.DatabaseName);
        _usersCollection = database.GetCollection<User>(mongoSettings.Value.UsersCollectionName);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _usersCollection.Find(user => user.Email == email).FirstOrDefaultAsync();
    }

    public async Task AddUserAsync(User user)
    {
        await _usersCollection.InsertOneAsync(user);
    }
}