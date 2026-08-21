using Application.Exceptions;
using Domain.Common;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Api.Exceptions.Handlers;

public sealed class CustomExceptionHandler(ILogger<CustomExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title, detail, logLevel) = exception switch
        {
            NotFoundException => (
                StatusCodes.Status404NotFound,
                "Ресурс не найден.",
                exception.Message,
                LogLevel.Information),

            DomainException => (
                StatusCodes.Status409Conflict,
                "Нарушено бизнес-правило.",
                exception.Message,
                LogLevel.Warning),

            _ => (
                StatusCodes.Status500InternalServerError,
                "Внутренняя ошибка сервера.",
                "Попробуйте выполнить запрос позже.",
                LogLevel.Error)
        };

        logger.Log(
            logLevel,
            exception,
            "Ошибка при обработке запроса {Path}.",
            httpContext.Request.Path);

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        problemDetails.Extensions.Add("traceId", httpContext.TraceIdentifier);

        httpContext.Response.StatusCode = statusCode;

        await httpContext.Response.WriteAsJsonAsync(
            problemDetails,
            cancellationToken: cancellationToken);

        return true;
    }
}