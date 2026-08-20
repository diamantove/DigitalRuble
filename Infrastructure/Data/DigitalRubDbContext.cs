using Domain.Clients;
using Domain.Wallets;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public sealed class DigitalRubDbContext : DbContext
{
    public DigitalRubDbContext(DbContextOptions<DigitalRubDbContext> options)
        : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();

    public DbSet<Wallet> Wallets => Set<Wallet>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(DigitalRubDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
