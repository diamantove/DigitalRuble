namespace Api.Contracts.Auth;

public sealed record CurrentUserResponse(
    Guid Id,
    string Email,
    string DisplayName,
    string Status,
    IReadOnlyList<string> Roles);