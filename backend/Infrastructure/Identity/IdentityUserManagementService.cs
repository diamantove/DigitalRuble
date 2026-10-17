using Application.Abstractions.Auth;
using Application.Abstractions.Users.Dto;
using Application.Exceptions;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Identity;

public sealed class IdentityUserManagementService(
        ApplicationDbContext dbContext,
        UserManager<CustomIdentityUser> userManager)
    : IUserManagementService
{
    public async Task<IReadOnlyList<AdminUserListItemDto>> GetUsersAsync(
        CancellationToken cancellationToken)
    {
        var rows = await dbContext.Users
            .AsNoTracking()
            .OrderBy(user => user.Email)
            .Select(user => new
            {
                user.Id,
                user.Email,
                user.DisplayName,
                user.LockoutEnd,
                Roles = dbContext.Set<IdentityUserRole<Guid>>()
                    .Where(userRole => userRole.UserId == user.Id)
                    .Join(dbContext.Roles,
                        userRole => userRole.RoleId,
                        role => role.Id,
                        (_, role) => role.Name)
                    .ToList()
            })
            .ToListAsync(cancellationToken);

        return rows.Select(row => new AdminUserListItemDto(
                row.Id,
                row.Email!,
                row.DisplayName,
                row.Roles.ToArray()!,
                row.LockoutEnd is not null && row.LockoutEnd > DateTimeOffset.UtcNow))
            .ToList();
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
        EnsureUserDataValid(createResult);

        var roleResult = await userManager.AddToRoleAsync(user, IdentityRoles.Operator);
        EnsureSucceeded(roleResult, "назначение роли Operator");
    }

    public async Task BlockAsync(Guid userId)
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
        EnsureSucceeded(result, "блокировка пользователя");
    }

    public async Task UnblockAsync(Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());

        if (user is null)
        {
            throw new UserNotFoundException(userId);
        }

        user.LockoutEnd = null;
        user.AccessFailedCount = 0;

        var result = await userManager.UpdateSecurityStampAsync(user);
        EnsureSucceeded(result, "разблокировка пользователя");
    }

    private static void EnsureUserDataValid(IdentityResult result)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join("; ", result.Errors.Select(error => error.Description));

        throw new ValidationException($"Не удалось создать оператора: {errors}");
    }

    private void EnsureSucceeded(IdentityResult result, string operation)
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