using System.ComponentModel.DataAnnotations;

namespace Api.Contracts.Users;

public sealed record CreateOperatorRequest(
    [param: Required]
    [param: EmailAddress]
    [param: StringLength(100)]
    string Email,

    [param: Required]
    string Password,

    [param: Required]
    [param: StringLength(100)]
    string DisplayName);
