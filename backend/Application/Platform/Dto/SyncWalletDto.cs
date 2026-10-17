using Domain.Wallets;

namespace Application.Platform.Dto;

public record SyncWalletDto(
    string WalletCode,
    WalletStatus Status,
    string? AccountNumber);
