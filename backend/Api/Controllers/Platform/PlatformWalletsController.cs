using Api.Contracts.Wallets.Platform;
using Application.Platform;
using Application.Platform.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Platform;

[ApiController]
[Route("api/platform/wallets")]
public sealed class PlatformWalletsController(PlatformWalletService platformWalletService)
    : ControllerBase
{
    [HttpPut]
    public async Task<IActionResult> Sync(
        [FromBody] SyncPlatformWalletRequest request,
        CancellationToken cancellationToken)
    {
        await platformWalletService.SyncAsync(
            request.Mid,
            new SyncWalletDto(
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
            new UpdateWalletDto(
                request.Status,
                request.AccountNumber),
            cancellationToken);

        return NoContent();
    }
}
