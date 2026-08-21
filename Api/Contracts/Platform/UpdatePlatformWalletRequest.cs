using System.ComponentModel.DataAnnotations;
using Domain.Wallets;

namespace Api.Contracts.Platform;

public sealed record UpdatePlatformWalletRequest(
    [param: EnumDataType(typeof(WalletStatus))]
    WalletStatus? Status,

    [param: StringLength(20)]
    string? AccountNumber) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Status is null && string.IsNullOrWhiteSpace(AccountNumber))
        {
            yield return new ValidationResult(
                "Нужно передать хотя бы одно поле: status или accountNumber.",
                [nameof(Status), nameof(AccountNumber)]);
        }
    }
}
