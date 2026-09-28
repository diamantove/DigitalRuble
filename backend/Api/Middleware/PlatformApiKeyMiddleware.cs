using System.Security.Cryptography;
using System.Text;

namespace Api.Middleware;

public sealed class PlatformApiKeyMiddleware(
    RequestDelegate next,
    IConfiguration configuration,
    ILogger<PlatformApiKeyMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments("/api/platform"))
        {
            await next(context);
            return;
        }

        var expectedHashValue = configuration["Platform:ApiKeyHash"];

        if (string.IsNullOrWhiteSpace(expectedHashValue))
        {
            logger.LogError("Platform API key hash не настроен.");

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            return;
        }

        if (!context.Request.Headers.TryGetValue("X-Api-Key", out var providedValues) ||
            providedValues.Count != 1 ||
            string.IsNullOrWhiteSpace(providedValues[0]))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;

            return;
        }

        byte[] expectedHash;

        try
        {
            expectedHash = Convert.FromBase64String(expectedHashValue);
        }
        catch (FormatException)
        {
            logger.LogError("Platform API key hash имеет неправильный формат.");

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            return;
        }

        var providedHash = SHA256.HashData(Encoding.UTF8.GetBytes(providedValues[0]!));

        if (!CryptographicOperations.FixedTimeEquals(providedHash, expectedHash))
        {
            logger.LogWarning("Platform API request rejected because API key is invalid.");

            context.Response.StatusCode = StatusCodes.Status401Unauthorized;

            return;
        }

        await next(context);
    }
}