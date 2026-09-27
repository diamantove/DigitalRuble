using Infrastructure.Data;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace Api.Extensions;

public static class ApplicationInitializationExtensions
{
    public static async Task InitializeDatabaseAsync(
        this WebApplication app,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        await using var scope = app.Services.CreateAsyncScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        var cancellationToken = CancellationToken.None;

        await DbInitializer.InitializeAsync(dbContext, cancellationToken);

        var roleManager = scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        await IdentitySeeder.SeedRolesAsync(roleManager, cancellationToken);

        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<CustomIdentityUser>>();
        await IdentitySeeder.SeedDevelopmentAdminAsync(
            userManager,
            roleManager,
            configuration);
    }
}