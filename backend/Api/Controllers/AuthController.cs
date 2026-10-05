using System.Security.Claims;
using Api.Contracts.Auth;
using Application.Abstractions.Auth;
using Application.Abstractions.Auth.ExternalLogin;
using Application.Abstractions.Users.Dto;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    IUserAuthenticationService authenticationService,
    IExternalLoginService externalLoginService)
    : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var succeeded = await authenticationService.SignInAsync(request.Email, request.Password);

        if (!succeeded)
        {
            return Problem(
                statusCode: StatusCodes.Status401Unauthorized,
                title: "Не удалось выполнить вход.",
                detail: "Проверьте почту и пароль."
            );
        }

        return NoContent();
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await authenticationService.SignOutAsync();

        return NoContent();
    }

    /// <summary>
    /// Инициирует процесс привязки аккаунта VK ID к текущему авторизованному профилю.
    /// </summary>
    /// <returns>Перенаправление на официальную страницу авторизации VK ID.</returns>
    /// <exception cref="InvalidOperationException">Выбрасывается, если не удалось сгенерировать обратную ссылку.</exception>
    [Authorize]
    [HttpGet("vk-id/link")]
    public IActionResult StartVkIdLink()
    {
        // Сборка абсолютного URL, на который VK должен вернуть пользователя для завершения привязки
        var callbackUrl = Url.Action(
            nameof(VkIdLinkCallback),
            "Auth",
            values: null,
            protocol: Request.Scheme);

        if (callbackUrl is null)
        {
            throw new InvalidOperationException("Не удалось сформировать URL для обратного вызова.");
        }

        // Вызов схемы "VK ID" — генерация OAuth-ссылки и перенаправление браузера в VK
        return Challenge(
            new AuthenticationProperties
            {
                RedirectUri = callbackUrl
            },
            "VK ID");
    }

    /// <summary>
    /// Callback, куда ASP.NET Core возвращает авторизованного пользователя из VK для завершения привязки.
    /// </summary>
    /// <returns>Безопасное перенаправление на фронтенд с query-параметром успешной привязки.</returns>
    [Authorize]
    [HttpGet("vk-id/link-callback")]
    public async Task<IActionResult> VkIdLinkCallback()
    {
        await externalLoginService.LinkAsync(GetCurrentUserId(), ExternalLoginProvider.VkId);

        return LocalRedirect("/auth/external?result=vk-id-linked");
    }

    /// <summary>
    /// Инициирует процесс входа анонимного пользователя на сайт через VK ID.
    /// </summary>
    /// <returns>Перенаправление на официальную страницу входа VK ID.</returns>
    /// <exception cref="InvalidOperationException">Выбрасывается, если не удалось сгенерировать обратную ссылку.</exception>
    [AllowAnonymous]
    [HttpGet("vk-id/login")]
    public IActionResult StartVkIdLogin()
    {
        // Сборка абсолютного URL, на который VK должен вернуть пользователя для проверки его аккаунта
        var callbackUrl = Url.Action(
            nameof(VkIdLoginCallback),
            "Auth",
            values: null,
            protocol: Request.Scheme)!;

        if (callbackUrl is null)
        {
            throw new InvalidOperationException("Не удалось сформировать URL для обратного вызова.");
        }

        // Отправление гостя на сервера VK для подтверждения личности
        return Challenge(new AuthenticationProperties
        {
            RedirectUri = callbackUrl
        },
            "VK ID");
    }

    /// <summary>
    /// Callback, куда ASP.NET Core возвращает пользователя из VK для завершения входа.
    /// </summary>
    /// <returns>Безопасное перенаправление на фронтенд с флагами статуса авторизации (Успех, Ошибка, Не привязан).</returns>
    [AllowAnonymous]
    [HttpGet("vk-id/login-callback")]
    public async Task<IActionResult> VkIdLoginCallback()
    {
        // Сервис достает полученный VK ID из контекста и пытается авторизовать локального пользователя в системе
        var result = await externalLoginService.SignInAsync(ExternalLoginProvider.VkId);

        return result.Status switch
        {
            // Пользователь найден и вошел -> выдаем флаг успеха
            ExternalLoginSignInStatus.Succeeded =>
                LocalRedirect("/auth/external?result=vk-id-signed-in"),

            // Личность подтверждена, но этот VK ID не зарегистрирован у нас -> фронтенд предложит создать аккаунт
            ExternalLoginSignInStatus.NotLinked =>
                LocalRedirect("/auth/external?error=vk-id-not-linked"),

            // Аккаунт заблокирован бекендом
            ExternalLoginSignInStatus.Blocked =>
                LocalRedirect("/auth/external?error=account-blocked"),

            _ =>
                LocalRedirect("/auth/external?error=vk-id-failed")
        };
    }

    /// <summary>
    /// Удаляет привязку аккаунта VK ID от профиля текущего авторизованного пользователя.
    /// </summary>
    /// <returns>204 No Content в случае успешного удаления.</returns>
    [Authorize]
    [HttpDelete("vk-id")]
    public async Task<IActionResult> UnlinkVkId()
    {
        await externalLoginService.UnlinkAsync(GetCurrentUserId(), ExternalLoginProvider.VkId);

        return NoContent();
    }

    /// <summary>
    /// Вспомогательный метод для безопасного извлечения и парсинга ID текущего пользователя из Claims.
    /// </summary>
    /// <returns>Идентификатор пользователя в формате Guid.</returns>
    /// <exception cref="UnauthorizedAccessException">Выбрасывается, если пользователь не авторизован или сессия повреждена.</exception>
    private Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(value, out var userId))
        {
            throw new UnauthorizedAccessException();
        }

        return userId;
    }
}