using Domain.Wallets;

namespace Application.Clients.Dtos;

public record WalletDto(
    string Code,
    WalletStatus Status,
    string? AccountNumber);
