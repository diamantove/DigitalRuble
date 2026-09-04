using System.Text.Json;
using System.Text.Json.Serialization;
using Api.Exceptions.Handlers;

namespace Api;


public static class DependencyInjection
{
    private const string FrontendPolicyName = "FrontendPolicy";

    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(FrontendPolicyName, policy =>
            {
                policy.WithOrigins("http://localhost:5173")
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        services
            .AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(
                    new JsonStringEnumConverter(
                        JsonNamingPolicy.CamelCase,
                        allowIntegerValues: false));
            });

        services.AddOpenApi();
        services.AddProblemDetails();
        services.AddExceptionHandler<CustomExceptionHandler>();

        return services;
    }

    public static WebApplication UseApiServices(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseExceptionHandler();
        app.UseHttpsRedirection();

        app.UseCors(FrontendPolicyName);

        app.UseAuthorization();

        app.MapControllers();

        return app;
    }
}
