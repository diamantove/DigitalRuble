using Api.Contracts.Wallets.Admin;
using Application.Platform;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminAccess")]
public sealed class AdminWalletsController(PlatformWalletService platformWalletService) 
    : ControllerBase
{
    [HttpPut("clients/{mid}/wallets")]
    public async Task<IActionResult> Sync(
        string mid,
        SyncAdminWalletRequest request,
        CancellationToken cancellationToken)
    {
        await platformWalletService.SyncAsync(
            new SyncWalletRequest(
                mid,
                request.WalletCode,
                request.Status!.Value,
                request.AccountNumber),
            cancellationToken);

        return NoContent();
    }

    [HttpPatch("wallets/{walletCode}")]
    public async Task<IActionResult> Update(
        string walletCode,
        UpdateAdminWalletRequest request,
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