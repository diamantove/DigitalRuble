using System.ComponentModel.DataAnnotations;

namespace Api.Contracts.Auth;

public sealed record LoginRequest(
    [param: Required]
    [param: EmailAddress]
    string Email,

    [param: Required]
    string Password);