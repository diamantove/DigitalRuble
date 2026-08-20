using Application.Clients;
using Application.Platform;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services)
    {
        services.AddScoped<ClientService>();
        services.AddScoped<PlatformWalletService>();

        return services;
    }
}
