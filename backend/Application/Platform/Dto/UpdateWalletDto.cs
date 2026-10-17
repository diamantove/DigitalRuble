using Domain.Wallets;

namespace Application.Platform.Dto;

public record UpdateWalletDto(
    WalletStatus? Status,
    string? AccountNumber);
