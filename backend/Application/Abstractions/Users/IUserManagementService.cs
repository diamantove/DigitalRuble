using Application.Abstractions.Users.Dto;

namespace Application.Abstractions.Users;

public interface IUserManagementService
{
    Task<IReadOnlyList<AdminUserListItemDto>> GetUsersAsync(
        CancellationToken cancellationToken);

    Task CreateOperatorAsync(
        string email,
        string password,
        string displayName);
    Task BlockAsync(Guid userId);

    Task UnblockAsync(Guid userId);
}
