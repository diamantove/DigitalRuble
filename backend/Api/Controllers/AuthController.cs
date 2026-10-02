using System.Security.Claims;
using Api.Contracts.Auth;
using Application.Abstractions.Users;
using Application.Abstractions.Users.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthenticationService authenticationService): ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var succeeded = await authenticationService.SignInAsync(request.Email, request.Password);

        if (!succeeded)
        {
            return Problem(
                statusCode: StatusCodes.Status401Unauthorized,
                title: "Не удалось выполнить вход.",
                detail: "Проверьте почту и пароль."
            );
        }

        return NoContent();
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await authenticationService.SignOutAsync();

        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<CurrentUserDto>> GetCurrentUser()
    {
        var userIdValue = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var user = await authenticationService.GetCurrentUserAsync(userId);

        return user is null ? Unauthorized() : Ok(user);
    }
}