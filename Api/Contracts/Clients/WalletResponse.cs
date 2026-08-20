using Domain.Wallets;

namespace Api.Contracts.Clients;

public sealed record WalletResponse(
    string Code,
    WalletStatus Status,
    string? AccountNumber);