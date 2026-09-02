using Application.Abstractions.Data;
using Domain.Clients;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public sealed class ClientRepository(IApplicationDbContext dbContext) : IClientRepository
{
    public async Task<IReadOnlyList<Client>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Clients
            .AsNoTracking()
            .OrderBy(client => client.FullName)
            .ToListAsync(cancellationToken);
    }

    public Task<Client?> GetByMidWithWalletsAsync(
        string mid,
        CancellationToken cancellationToken)
    {
        return dbContext.Clients
            .Include(client => client.Wallets)
            .SingleOrDefaultAsync(client => client.Mid == mid, cancellationToken);
    }

    public Task<bool> DigitalRubleParticipantIdExistsForAnotherClientAsync(
        string mid,
        string digitalRubleParticipantId,
        CancellationToken cancellationToken)
    {
        return dbContext.Clients
            .AsNoTracking()
            .AnyAsync(
                client => client.DigitalRubleParticipantId == digitalRubleParticipantId
                    && client.Mid != mid,
                cancellationToken);
    }

    public Task<Client?> GetByMidAsync(string mid, CancellationToken cancellationToken)
    {
        return dbContext.Clients
            .AsNoTracking()
            .SingleOrDefaultAsync(client => client.Mid == mid, cancellationToken);
    }

    public Task UpdateAsync(Client client, CancellationToken cancellationToken)
    {
        dbContext.Clients.Update(client);
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
