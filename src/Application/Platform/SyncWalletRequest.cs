using Domain.Wallets;

namespace Application.Platform;

public record SyncWalletRequest(
    string Mid,
    string WalletCode,
    WalletStatus Status,
    string? AccountNumber);
