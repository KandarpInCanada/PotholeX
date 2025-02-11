using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using PotholeBackendApp.domain.entities;
using PotholeBackendApp.infrastructure.repository;

namespace PotholeBackendApp.application.services;

public interface IAuthService
{
    Task<string?> RegisterUserAsync(string name, string email, string password);
    Task<string?> AuthenticateUserAsync(string email, string password);
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _config;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthService(IUserRepository userRepository, IConfiguration config)
    {
        _userRepository = userRepository;
        _config = config;
    }

    public async Task<string> RegisterUserAsync(string name, string email, string password)
    {
        var existingUser = await _userRepository.GetByEmailAsync(email);
        if (existingUser != null)
            throw new Exception("User already exists"); // Ideally, return an API response with HTTP 409 (Conflict)

        var hashedPassword = _passwordHasher.HashPassword(null, password);
        var newUser = new User { Name = name, Email = email, PasswordHash = hashedPassword };
        await _userRepository.AddUserAsync(newUser);
        return "User registered successfully";
    }

    public async Task<string> AuthenticateUserAsync(string email, string password)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null || _passwordHasher.VerifyHashedPassword(null, user.PasswordHash, password) != PasswordVerificationResult.Success)
            return null;
        return GenerateJwtToken(user);
    }

    private string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        };
        var token = new JwtSecurityToken(
            _config["Jwt:Issuer"],
            _config["Jwt:Audience"],
            claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}