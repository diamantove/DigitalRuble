using System.ComponentModel.DataAnnotations;
using Domain.Wallets;

namespace Api.Contracts.Platform;

public sealed record SyncPlatformWalletRequest(
    [param: Required]
    [param: StringLength(100)]
    string Mid,

    [param: Required]
    [param: StringLength(100)]
    string WalletCode,

    [param: Required]
    [param: EnumDataType(typeof(WalletStatus))]
    WalletStatus? Status,

    [param: StringLength(20)]
    string? AccountNumber);