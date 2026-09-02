using Api.Contracts.Platform;
using Application.Platform;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/platform/wallets")]
public sealed class PlatformWalletsController(PlatformWalletService platformWalletService) : ControllerBase
{
    [HttpPut]
    public async Task<IActionResult> Sync(
        [FromBody] SyncPlatformWalletRequest request,
        CancellationToken cancellationToken)
    {
        await platformWalletService.SyncAsync(
            new SyncWalletRequest(
                request.Mid,
                request.WalletCode,
                request.Status!.Value,
                request.AccountNumber),
            cancellationToken);

        return NoContent();
    }

    [HttpPatch("{walletCode}")]
    public async Task<IActionResult> Update(
        string walletCode,
        [FromBody] UpdatePlatformWalletRequest request,
        CancellationToken cancellationToken)
    {
        await platformWalletService.UpdateAsync(
            walletCode,
            new UpdateWalletRequest(
                request.Status,
                request.AccountNumber),
            cancellationToken);

        return NoContent();
    }
}
