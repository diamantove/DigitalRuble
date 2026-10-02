using System.ComponentModel.DataAnnotations;
using Domain.Wallets;

namespace Api.Contracts.Wallets.Admin;

public sealed record SyncAdminWalletRequest(
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