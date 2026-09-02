using Domain.Clients;
using Domain.Wallets;
using Microsoft.EntityFrameworkCore;

namespace Application.Abstractions.Data;

public interface IApplicationDbContext
{
    DbSet<Client> Clients { get; }
    DbSet<Wallet> Wallets { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
