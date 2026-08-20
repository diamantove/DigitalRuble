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
        Guid clientId,
        CancellationToken cancellationToken);
}
