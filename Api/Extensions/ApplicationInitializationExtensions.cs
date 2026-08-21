using Infrastructure.Data;

namespace Api.Extensions;

public static class ApplicationInitializationExtensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
            return;

        await using var scope = app.Services.CreateAsyncScope();

        var dbContext = scope.ServiceProvider
            .GetRequiredService<DigitalRubDbContext>();

        await DbInitializer.InitializeAsync(
            dbContext,
            CancellationToken.None);
    }
}