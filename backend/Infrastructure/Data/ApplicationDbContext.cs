using System.Reflection;
using Application.Abstractions.Data;
using Application.Exceptions;
using Domain.Clients;
using Domain.Wallets;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Infrastructure.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options), IApplicationDbContext
{
    public DbSet<Client> Clients => Set<Client>();

    public DbSet<Wallet> Wallets => Set<Wallet>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            Assembly.GetExecutingAssembly()
        );
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (IsUniqueConstraintViolation(exception))
        {
            throw new PersistenceConflictException(
                "Операция конфликтует с уже существующими данными.",
                exception);
        }
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException exception)
    {
        return exception.InnerException is PostgresException postgresException &&
               postgresException.SqlState == PostgresErrorCodes.UniqueViolation;
    }
}