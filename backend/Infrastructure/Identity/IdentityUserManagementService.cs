using Application.Abstractions.Users;
using Application.Abstractions.Users.Dto;
using Application.Exceptions;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public sealed class IdentityUserManagementService(
        UserManager<CustomIdentityUser> userManager)
    : IUserManagementService
{
    public async Task<IReadOnlyList<AdminUserListItemDto>> GetUsersAsync(
        CancellationToken cancellationToken)
    {
        var users = await userManager.Users
            .OrderBy(user => user.Email)
            .ToListAsync(cancellationToken);

        var result = new List<AdminUserListItemDto>();

        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);

            var isBlocked =
                user.LockoutEnd.HasValue &&
                user.LockoutEnd > DateTimeOffset.UtcNow;

            result.Add(new AdminUserListItemDto(
                user.Id,
                user.Email!,
                user.DisplayName,
                roles.ToArray(),
                isBlocked));
        }

        return result;
    }

    public async Task CreateOperatorAsync(
        string email,
        string password,
        string displayName)
    {
        var existingUser = await userManager.FindByEmailAsync(email);

        if (existingUser is not null)
        {
            throw new UserAlreadyExistsException(email);
        }

        var user = new CustomIdentityUser
        {
            UserName = email,
            Email = email,
            DisplayName = displayName,
            EmailConfirmed = false,
            LockoutEnabled = true
        };

        var createResult = await userManager.CreateAsync(user, password);
        EnsureSucceeded(createResult, "создание пользователя");

        var roleResult = await userManager.AddToRoleAsync(user, IdentityRoles.Operator);
        EnsureSucceeded(roleResult, "назначение роли Operator");
    }

    public async Task<bool> BlockAsync(Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());

        if (user is null)
        {
            throw new UserNotFoundException(userId);
        }

        var role = await userManager.GetRolesAsync(user);

        if (role.Contains(IdentityRoles.Admin))
        {
            throw new ForbiddenException("Невозможно заблокировать пользователя с ролью Admin");
        }

        user.LockoutEnabled = true;
        user.LockoutEnd = DateTimeOffset.MaxValue;

        var result = await userManager.UpdateSecurityStampAsync(user);

        return result.Succeeded;
    }

    public async Task<bool> UnblockAsync(Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            return false;
        }

        user.LockoutEnd = null;
        user.AccessFailedCount = 0;

        var stampResult = await userManager.UpdateSecurityStampAsync(user);

        return stampResult.Succeeded;
    }

    private static void EnsureSucceeded(IdentityResult result, string operation)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join("; ", result.Errors.Select(error =>
                $"{error.Code}: {error.Description}"));

        throw new InvalidOperationException(
            $"Не удалось выполнить операцию '{operation}': {errors}");
    }

}