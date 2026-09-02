using Domain.Clients;

namespace Application.Abstractions.Data;

public interface IClientRepository
{
    Task<IReadOnlyList<Client>> GetAllAsync(CancellationToken cancellationToken);

    Task<Client?> GetByMidWithWalletsAsync(
        string mid,
        CancellationToken cancellationToken);

    Task<bool> DigitalRubleParticipantIdExistsForAnotherClientAsync(
        string digitalRubleParticipantId,
        string mid,
        CancellationToken cancellationToken);

    Task<Client?> GetByMidAsync(
        string mid,
        CancellationToken cancellationToken);

    Task UpdateAsync(
        Client client,
        CancellationToken cancellationToken);
}
