using Application.Abstractions.Data;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("SqliteConnection")
                ?? throw new InvalidOperationException("Строка подключения не найдена.");

        services.AddDbContext<DigitalRubDbContext>(options =>
            options.UseSqlite(connectionString));

        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<IWalletRepository, WalletRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}
