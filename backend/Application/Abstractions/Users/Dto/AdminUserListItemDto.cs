namespace Application.Abstractions.Users.Dto;

public record AdminUserListItemDto(
    Guid Id,
    string Email,
    string DisplayName,
    string[] Roles,
    bool IsBlocked
);