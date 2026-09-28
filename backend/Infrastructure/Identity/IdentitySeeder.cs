using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Infrastructure.Identity;

public static class IdentitySeeder
{
    public static async Task SeedRolesAsync(
        RoleManager<IdentityRole<Guid>> roleManager,
        CancellationToken cancellationToken)
    {
        foreach (var roleName in IdentityRoles.All)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (await roleManager.RoleExistsAsync(roleName))
            {
                continue;
            }

            var result = await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));

            EnsureSucceeded(result, $"создание роли '{roleName}'");
        }
    }

    public static async Task SeedDevelopmentAdminAsync(
        UserManager<CustomIdentityUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IConfiguration configuration)
    {
        var section = configuration.GetSection("Identity:SeedAdmin");

        var enabled = section.GetValue<bool>("Enabled");

        if (!enabled)
        {
            return;
        }

        var email = section["Email"];
        var password = section["Password"];
        var displayName = section["DisplayName"];

        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(displayName))
        {
            throw new InvalidOperationException(
                "Для создания Admin необходимо задать " +
                "Identity:SeedAdmin:Email, " +
                "Identity:SeedAdmin:Password и " +
                "Identity:SeedAdmin:DisplayName.");
        }

        if (!await roleManager.RoleExistsAsync(IdentityRoles.Admin))
        {
            var roleResult = await roleManager.CreateAsync(new IdentityRole<Guid>(IdentityRoles.Admin));

            EnsureSucceeded(roleResult, $"создание роли '{IdentityRoles.Admin}'");
        }

        var existingUser = await userManager.FindByEmailAsync(email);

        if (existingUser is not null)
        {
            if (!await userManager.IsInRoleAsync(existingUser, IdentityRoles.Admin))
            {
                throw new InvalidOperationException(
                    $"Пользователь '{email}' уже существует, " +
                    "но не имеет роль Admin.");
            }

            return;
        }

        var user = new CustomIdentityUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            DisplayName = displayName
        };

        var createResult = await userManager.CreateAsync(user, password);
        EnsureSucceeded(createResult, $"создание пользователя '{email}'");

        var addRoleResult = await userManager.AddToRoleAsync(user, IdentityRoles.Admin);
        EnsureSucceeded(addRoleResult, $"назначение роли '{IdentityRoles.Admin}'");
    }

    private static void EnsureSucceeded(IdentityResult result, string operation)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join("; ", result.Errors.Select(error =>
                $"{error.Code}: {error.Description}"));

        throw new InvalidOperationException($"Не удалось выполнить {operation}: {errors}");
    }

}