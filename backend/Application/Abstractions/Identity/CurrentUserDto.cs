namespace Application.Identity;

public sealed record CurrentUserDto(
    Guid Id,
    string Email,
    string DisplayName, 
    string[] Roles);