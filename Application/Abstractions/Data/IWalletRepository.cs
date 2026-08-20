using Domain.Wallets;

namespace Application.Abstractions.Data;

public interface IWalletRepository
{
    Task<bool> CodeExistsAsync(
        string code,
        CancellationToken cancellationToken);

    Task<Wallet?> GetByCodeAsync(
        string code,
        CancellationToken cancellationToken);
}
