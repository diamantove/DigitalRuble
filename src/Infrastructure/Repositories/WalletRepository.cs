using Domain.Wallets;
using Application.Abstractions.Data;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public sealed class WalletRepository(ApplicationDbContext dbContext) : IWalletRepository
{
    public Task<bool> CodeExistsAsync(
        string code,
        CancellationToken cancellationToken)
    {
        return dbContext.Wallets
            .AsNoTracking()
            .AnyAsync(wallet => wallet.Code == code, cancellationToken);
    }

    public Task<Wallet?> GetByCodeAsync(
        string code,
        CancellationToken cancellationToken)
    {
        return dbContext.Wallets
            .SingleOrDefaultAsync(
                wallet => wallet.Code == code,
                cancellationToken);
    }

    public Task<bool> AccountNumberExistsForAnotherWalletAsync(
        string accountNumber,
        string excludingWalletCode,
        CancellationToken cancellationToken)
    {
        return dbContext.Wallets
            .AsNoTracking()
            .AnyAsync(
                wallet => wallet.AccountNumber == accountNumber
                        && wallet.Code != excludingWalletCode,
                cancellationToken);
    }
}
