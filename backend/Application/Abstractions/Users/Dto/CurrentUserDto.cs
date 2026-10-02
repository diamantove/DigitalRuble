namespace Application.Abstractions.Users.Dto;

public sealed record CurrentUserDto(
    Guid Id,
    string Email,
    string DisplayName, 
    string[] Roles);