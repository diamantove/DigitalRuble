using Api.Contracts.Users;
using Application.Abstractions.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Policy = "AdminAccess")]
public sealed class AdminUsersController(IUserManagementService userManagementService)
    : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var users = await userManagementService.GetUsersAsync(cancellationToken);

        return Ok(users);
    }

    [HttpPost("operators")]
    public async Task<IActionResult> CreateOperator(CreateOperatorRequest request)
    {
        await userManagementService.CreateOperatorAsync(
            request.Email,
            request.Password,
            request.DisplayName);

        return NoContent();
    }

    [HttpPatch("{userId:guid}/block")]
    public async Task<IActionResult> Block(Guid userId)
    {
        await userManagementService.BlockAsync(userId);

        return NoContent();
    }

    [HttpPatch("{userId:guid}/unblock")]
    public async Task<IActionResult> Unblock(Guid userId)
    {
        await userManagementService.UnblockAsync(userId);

        return NoContent();
    }
}
