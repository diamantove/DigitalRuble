using Application.Abstractions.Data;
using Domain.Clients;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public sealed class ClientRepository : IClientRepository
{
    private readonly DigitalRubDbContext _dbContext;

    public ClientRepository(DigitalRubDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Client>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _dbContext.Clients
            .AsNoTracking()
            .OrderBy(client => client.FullName)
            .ToListAsync(cancellationToken);
    }

    public Task<Client?> GetByMidWithWalletsAsync(
        string mid,
        CancellationToken cancellationToken)
    {
        return _dbContext.Clients
            .Include(client => client.Wallets)
            .SingleOrDefaultAsync(client => client.Mid == mid, cancellationToken);
    }

    public Task<bool> DigitalRubleParticipantIdExistsForAnotherClientAsync(
        string digitalRubleParticipantId,
        Guid clientId,
        CancellationToken cancellationToken)
    {
        return _dbContext.Clients
            .AsNoTracking()
            .AnyAsync(
                client => client.DigitalRubleParticipantId == digitalRubleParticipantId
                    && client.Id != clientId,
                cancellationToken);
    }
}
