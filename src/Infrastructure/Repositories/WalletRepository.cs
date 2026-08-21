using Domain.Wallets;
using Application.Abstractions.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public sealed class WalletRepository : IWalletRepository
{
    private readonly DigitalRubDbContext _dbContext;

    public WalletRepository(DigitalRubDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<bool> CodeExistsAsync(
        string code,
        CancellationToken cancellationToken)
    {
        return _dbContext.Wallets
            .AsNoTracking()
            .AnyAsync(wallet => wallet.Code == code, cancellationToken);
    }

    public Task<Wallet?> GetByCodeAsync(
        string code,
        CancellationToken cancellationToken)
    {
        return _dbContext.Wallets
            .SingleOrDefaultAsync(
                wallet => wallet.Code == code,
                cancellationToken);
    }

    public Task<bool> AccountNumberExistsAsync(
        string accountNumber,
        CancellationToken cancellationToken)
    {
        return _dbContext.Wallets
            .AsNoTracking()
            .AnyAsync(
                wallet => wallet.AccountNumber == accountNumber,
                cancellationToken);
    }
}
