using System.ComponentModel.DataAnnotations;

namespace Api.Contracts.Users;

public sealed record CreateOperatorRequest(
    [property: Required]
    [property: EmailAddress]
    [property: StringLength(100)]
    string Email,

    [property: Required]
    string Password,

    [property: Required]
    [property: StringLength(100)]
    string DisplayName);
