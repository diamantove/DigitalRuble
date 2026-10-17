using Api.Contracts.Clients;
using Api.Contracts.Wallets.Operator;
using Application.Clients;
using Application.Platform;
using Application.Platform.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Clients;

[ApiController]
[Route("api/operator/clients")]
[Authorize(Policy = "OperatorAccess")]
public sealed class OperatorClientsController(
    ClientService clientService,
    PlatformWalletService walletService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ClientListItemResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var clients = await clientService.GetAllAsync(cancellationToken);

        return Ok(clients.Select(client => new ClientListItemResponse(
            client.Mid,
            client.FullName,
            client.DigitalRubleParticipantId)));
    }

    [HttpGet("{mid}/wallets")]
    public async Task<ActionResult<IReadOnlyList<WalletResponse>>> GetWallets(
        string mid,
        CancellationToken cancellationToken)
    {
        var wallets = await clientService.GetWalletsByClientMidAsync(
            mid,
            cancellationToken);

        return Ok(wallets.Select(wallet => new WalletResponse(
            wallet.Code,
            wallet.Status,
            wallet.AccountNumber)));
    }

    [HttpPut("{mid}/participant-id")]
    public async Task<IActionResult> UpdateParticipantId(
        string mid,
        [FromBody] AssignParticipantIdRequest request,
        CancellationToken cancellationToken)
    {
        await clientService.UpdateDigitalRubleParticipantIdAsync(
            mid,
            request.DigitalRubleParticipantId,
            cancellationToken);

        return NoContent();
    }

    [HttpPut("{mid}/wallets")]
    public async Task<IActionResult> Sync(
        string mid,
        [FromBody] SyncWalletRequest request,
        CancellationToken cancellationToken)
    {
        await walletService.SyncAsync(
            mid,
            new SyncWalletDto(
                request.WalletCode,
                request.Status!.Value,
                request.AccountNumber),
            cancellationToken);

        return NoContent();
    }
}
