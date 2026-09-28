using Api.Contracts.Wallets.Operator;
using Application.Platform;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize(Policy = "OperatorAccess")]
[ApiController]
[Route("api/operator")]
public sealed class OperatorWalletsController(
    PlatformWalletService platformWalletService) : ControllerBase
{
    [HttpPut("clients/{mid}/wallets")]
    public async Task<IActionResult> Sync(
        string mid,
        SyncOperatorWalletRequest request,
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
        UpdateOperatorWalletRequest request,
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