using System.Text.Json;
using System.Text.Json.Serialization;
using Api.Exceptions.Handlers;
using Api.Middleware;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi;

namespace Api;

public static class DependencyInjection
{
    private const string FrontendPolicyName = "FrontendPolicy";

    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IHostEnvironment environment)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(FrontendPolicyName, policy =>
            {
                policy.WithOrigins("http://localhost:5173")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
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

        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = IdentityConstants.ApplicationScheme;
                options.DefaultSignInScheme = IdentityConstants.ApplicationScheme;
                options.DefaultChallengeScheme = IdentityConstants.ApplicationScheme;
            })
            .AddCookie(IdentityConstants.ApplicationScheme, options =>
            {
                options.Cookie.Name = "digitalrub.auth";
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = environment.IsDevelopment()
                        ? CookieSecurePolicy.SameAsRequest
                        : CookieSecurePolicy.Always;

                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;

                    return Task.CompletedTask;
                };

                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;

                    return Task.CompletedTask;
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("OperatorAccess", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireRole("Operator", "Admin");
            });
        });

        services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, _, _) =>
            {
                document.Components ??= new OpenApiComponents();
                document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

                document.Components.SecuritySchemes["PlatformApiKey"] = new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.ApiKey,
                    Name = "X-Api-Key",
                    In = ParameterLocation.Header,
                    Description = "API key для platform API."
                };

                foreach (var (path, pathItem) in document.Paths)
                {
                    if (!path.StartsWith("/api/platform/", StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    if (pathItem.Operations is null)
                    {
                        continue;
                    }

                    foreach (var operation in pathItem.Operations.Values)
                    {
                        operation.Security ??= [];

                        operation.Security.Add(new OpenApiSecurityRequirement
                        {
                            [new OpenApiSecuritySchemeReference("PlatformApiKey", document)] = []
                        });
                    }
                }

                return Task.CompletedTask;
            });
        });

        services.AddProblemDetails();
        services.AddExceptionHandler<CustomExceptionHandler>();

        services.AddHealthChecks();

        return services;
    }

    public static WebApplication UseApiServices(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();

            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/openapi/v1.json", "Digital Ruble API V1");
                options.RoutePrefix = "swagger";
            });
        }

        app.UseExceptionHandler();

        if (app.Configuration.GetValue<bool>("HttpsRedirection:Enabled"))
        {
            app.UseHttpsRedirection();
        }

        app.UseCors(FrontendPolicyName);

        app.UseHealthChecks("/health");

        app.UseMiddleware<PlatformApiKeyMiddleware>();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        return app;
    }
}
