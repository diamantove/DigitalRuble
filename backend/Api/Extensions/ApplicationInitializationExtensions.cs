using Infrastructure.Data;

namespace Api.Extensions;

public static class ApplicationInitializationExtensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        await using var scope = app.Services.CreateAsyncScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        await DbInitializer.InitializeAsync(
            dbContext,
            CancellationToken.None);
    }
}