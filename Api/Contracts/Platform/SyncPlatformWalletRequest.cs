using System.ComponentModel.DataAnnotations;
using Domain.Wallets;

namespace Api.Contracts.Platform;

public sealed record SyncPlatformWalletRequest(
    [property: Required]
    [property: StringLength(100)]
    string Mid,

    [property: Required]
    [property: StringLength(100)]
    string DigitalRubleParticipantId,

    [property: Required]
    [property: StringLength(100)]
    string WalletCode,

    [property: Required]
    [property: EnumDataType(typeof(WalletStatus))]
    WalletStatus? Status,

    [property: StringLength(20)]
    string? AccountNumber);