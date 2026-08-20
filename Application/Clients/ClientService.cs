using Application.Abstractions.Data;
using Application.Clients.Dtos;

namespace Application.Clients;

public sealed class ClientService
{
    private readonly IClientRepository _clientRepository;

    public ClientService(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<IReadOnlyList<ClientListItemDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var clients = await _clientRepository.GetAllAsync(cancellationToken);

        return clients
            .Select(client => new ClientListItemDto(
                client.Mid,
                client.FullName,
                client.DigitalRubleParticipantId))
            .ToList();
    }

    public async Task<IReadOnlyList<WalletDto>> GetWalletsByClientMidAsync(
        string mid,
        CancellationToken cancellationToken)
    {
        var client = await _clientRepository.GetByMidWithWalletsAsync(
            mid,
            cancellationToken);

        if (client is null)
            throw new InvalidOperationException($"Клиент с MID '{mid}' не найден.");

        return client.Wallets
            .Select(wallet => new WalletDto(
                wallet.Code,
                wallet.Status,
                wallet.AccountNumber))
            .ToList();
    }
}
