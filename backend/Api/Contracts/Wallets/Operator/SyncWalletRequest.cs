using System.ComponentModel.DataAnnotations;
using Domain.Wallets;

namespace Api.Contracts.Wallets.Operator;

public sealed record SyncWalletRequest(
    [param: Required]
    [param: StringLength(100)]
    string WalletCode,

    [param: Required]
    [param: EnumDataType(typeof(WalletStatus))]
    WalletStatus? Status,

    [param: StringLength(20)]
    string? AccountNumber);
