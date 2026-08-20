using Domain.Wallets;

namespace Application.Platform;

public record UpdateWalletRequest(
    WalletStatus? Status,
    string? AccountNumber);
