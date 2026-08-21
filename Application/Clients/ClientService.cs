using Application.Abstractions.Data;
using Application.Clients.Dtos;
using Application.Exceptions;

namespace Application.Clients;

public sealed class ClientService(IClientRepository clientRepository)
{
    public async Task<IReadOnlyList<ClientListItemDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var clients = await clientRepository.GetAllAsync(cancellationToken);

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
        var client = await clientRepository.GetByMidWithWalletsAsync(
            mid,
            cancellationToken);

        if (client is null)
            throw new NotFoundException($"Клиент с MID '{mid}' не найден.");

        return client.Wallets
            .Select(wallet => new WalletDto(
                wallet.Code,
                wallet.Status,
                wallet.AccountNumber))
            .ToList();
    }
}
