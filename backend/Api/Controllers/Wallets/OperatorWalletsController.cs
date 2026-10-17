using Api.Contracts.Wallets.Operator;
using Application.Platform;
using Application.Platform.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Wallets;

[ApiController]
[Route("api/operator/wallets")]
[Authorize(Policy = "OperatorAccess")]
public sealed class OperatorWalletsController(PlatformWalletService walletService)
    : ControllerBase
{
    [HttpPatch("{walletCode}")]
    public async Task<IActionResult> Update(
        string walletCode,
        [FromBody] UpdateWalletRequest request,
        CancellationToken cancellationToken)
    {
        await walletService.UpdateAsync(
            walletCode,
            new UpdateWalletDto(
                request.Status,
                request.AccountNumber),
            cancellationToken);

        return NoContent();
    }
}
