using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PotholeBackendApp.application.services;
using PotholeBackendApp.domain.dtos;

namespace PotholeBackendApp.api.controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserDto newUser)
    {
        var result = await authService.RegisterUserAsync(newUser.Name, newUser.Email, newUser.Password);
        if (result == "User already exists")
            return Conflict(new { message = result });
        return Ok(new { message = result });
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserDto user)
    {
        var token = await authService.AuthenticateUserAsync(user.Email, user.Password);
        if (token == null)
            return Unauthorized(new { message = "Invalid credentials" });
        return Ok(new { token });
    }
    
    [Authorize]
    [HttpGet("protected")]
    public IActionResult ProtectedEndpoint()
    {
        return Ok(new { message = "You have accessed a protected route!" });
    }
}