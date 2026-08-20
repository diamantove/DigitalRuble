using Api.Contracts.Clients;
using Application.Clients;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/clients")]
public sealed class ClientsController(ClientService clientService) : ControllerBase
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
}
