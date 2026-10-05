using Application.Abstractions.Auth.ExternalLogin;
using Application.Exceptions;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Identity;

/// <summary>
/// Сервис для управления процессами внешней аутентификации и привязки аккаунтов
/// на базе стандартного механизма ASP.NET Core Identity.
/// </summary>
public sealed class IdentityVkIdLoginService(
    UserManager<CustomIdentityUser> userManager,
    SignInManager<CustomIdentityUser> signInManager)
    : IExternalLoginService
{
    private const string VkIdScheme = "VK ID";

    /// <summary>
    /// Привязывает внешний аккаунт социальной сети к уже существующему локальному профилю пользователя.
    /// </summary>
    /// <param name="userId">Уникальный идентификатор текущего авторизованного пользователя в системе.</param>
    /// <param name="provider">Тип внешнего провайдера (например, VkId).</param>
    /// <exception cref="ExternalLoginException">
    /// Выбрасывается, если пользователь не найден, если данные от провайдера не получены, 
    /// либо если этот внешний аккаунт уже привязан к другому профилю на сайте.
    /// </exception>
    public async Task LinkAsync(Guid userId, ExternalLoginProvider provider)
    {
        // Существует ли локальный пользователь в нашей базе данных
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new ExternalLoginException("Текущий оператор не найден.");

        // Данные внешней авторизации, которые фреймворк временно сохранил в контексте запроса
        var externalLogin = await GetExternalLoginAsync(provider);

        // Не привязан ли этот внешний аккаунт (например, этот VK ID) уже к кому-то в базе данных
        var alreadyLinkedUser = await userManager.FindByLoginAsync(
            externalLogin.LoginProvider,
            externalLogin.ProviderKey);

        // Если аккаунт уже привязан к другому пользователю — операция запрещена
        if (alreadyLinkedUser is not null && alreadyLinkedUser.Id != user.Id)
        {
            throw new ExternalLoginException("Этот аккаунт VK ID уже привязан к другому оператору.");
        }

        // Аккаунт уже привязан к этому же пользователю
        if (alreadyLinkedUser?.Id == user.Id)
        {
            return;
        }

        var logins = await userManager.GetLoginsAsync(user);

        if (logins.Any(login => login.LoginProvider == VkIdScheme))
        {
            throw new ExternalLoginException("У оператора уже привязан VK ID.");
        }

        // Новую запись связи между нашим пользователем и внешним провайдером в таблице AspNetUserLogins
        var result = await userManager.AddLoginAsync(
            user,
            new UserLoginInfo(
                externalLogin.LoginProvider,
                externalLogin.ProviderKey,
                externalLogin.ProviderDisplayName));

        // Проверка успешности сохранения в БД
        EnsureSucceeded(result);
    }

    /// <summary>
    /// Выполняет авторизацию пользователя через внешний сервис.
    /// </summary>  
    /// <param name="provider">Тип внешнего провайдера (например, VkId).</param>
    /// <returns>Результат попытки входа, содержащий статус операции (Успешно, Не привязан, Блокирован, Ошибка).</returns>
    public async Task<ExternalLoginSignInResult> SignInAsync(ExternalLoginProvider provider)
    {
        // Данные внешнего входа, прилетевшие в текущем HTTP-запросе
        var externalLogin = await GetExternalLoginAsync(provider);

        // Данные локального пользователя, к которому привязан данный внешний ID
        var user = await userManager.FindByLoginAsync(
            externalLogin.LoginProvider,
            externalLogin.ProviderKey);

        // Если связь в базе данных отсутствует, статус NotLinked (нужна привязка)
        if (user is null)
        {
            return new ExternalLoginSignInResult(ExternalLoginSignInStatus.NotLinked);
        }

        // Если пользователь найден, SignInManager создает для него постоянную сессию
        var result = await signInManager.ExternalLoginSignInAsync(
            externalLogin.LoginProvider,
            externalLogin.ProviderKey,
            isPersistent: false,
            bypassTwoFactor: false);

        // Преобразование внутренних статусов IdentityResult в кастомные статусы бизнес-логики
        return new ExternalLoginSignInResult(result.Succeeded
                ? ExternalLoginSignInStatus.Succeeded
                : result.IsLockedOut
                    ? ExternalLoginSignInStatus.Blocked
                    : ExternalLoginSignInStatus.Failed);
    }

    /// <summary>
    /// Удаляет привязку внешнего аккаунта (отвязывает социальную сеть) от профиля пользователя.
    /// </summary>
    /// <param name="userId">Уникальный идентификатор пользователя в системе.</param>
    /// <param name="provider">Тип внешнего провайдера, который нужно отвязать.</param>
    /// <exception cref="ExternalLoginException">
    /// Выбрасывается, если пользователь не найден, либо если это единственный способ входа, а локального пароля у пользователя нет.
    /// </exception>
    public async Task UnlinkAsync(Guid userId, ExternalLoginProvider provider)
    {
        // Существование пользователя в БД
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new ExternalLoginException(
                "Текущий оператор не найден.");

        // Строковое имя схемы провайдера и список всех внешних входов пользователя
        var providerScheme = GetProviderScheme(provider);
        var logins = await userManager.GetLoginsAsync(user);

        // Конкретная запись о привязке нужного провайдера
        var externalLogin = logins.SingleOrDefault(login => login.LoginProvider == providerScheme);

        // Если социальная сеть и так не была привязана
        if (externalLogin is null)
        {
            return;
        }

        // Проверка, есть ли у пользователя обычный пароль
        var hasPassword = await userManager.HasPasswordAsync(user);

        // Если локального пароля нет и эта соцсеть — единственный способ войти, отвязка запрещена,
        // иначе пользователь навсегда заблокирует себе доступ к аккаунту.
        if (!hasPassword && logins.Count == 1)
        {
            throw new ExternalLoginException("Нельзя отвязать единственный способ входа.");
        }

        // Удаление записи из таблицы AspNetUserLogins
        var result = await userManager.RemoveLoginAsync(
            user,
            externalLogin.LoginProvider,
            externalLogin.ProviderKey);

        // Проверка успешности сохранения в БД
        EnsureSucceeded(result);
    }

    /// <summary>
    /// Вспомогательный метод для извлечения данных внешнего входа из контекста текущего HTTP-запроса 
    /// и их валидации на соответствие ожидаемому провайдеру.
    /// </summary>
    /// <param name="provider">Ожидаемый провайдер внешней авторизации.</param>
    /// <returns>Объект с данными внешнего входа (содержит ProviderKey, LoginProvider и др.).</returns>
    /// <exception cref="ExternalLoginException">
    /// Выбрасывается, если данные в контексте отсутствуют (например, ошибка авторизации на стороне VK) 
    /// или если пришедшие данные принадлежат другому провайдеру (например, Telegram вместо VK).
    /// </exception>
    private async Task<ExternalLoginInfo> GetExternalLoginAsync(ExternalLoginProvider provider)
    {
        // Все то, что Middleware аутентификации распаковал из ответа внешней соцсети в текущую сессию запроса
        var externalLogin = await signInManager.GetExternalLoginInfoAsync();

        var providerScheme = GetProviderScheme(provider);

        // Валидация: данные вообще есть и их LoginProvider совпадает с ожидаемым
        if (externalLogin is null || !string.Equals(
                externalLogin.LoginProvider,
                providerScheme,
                StringComparison.Ordinal))
        {
            throw new ExternalLoginException($"Не удалось получить данные внешнего входа {provider}.");
        }

        return externalLogin;
    }

    /// <summary>
    /// Вспомогательный метод-маппер, переводящий строго типизированный Enum провайдеров в системную строку-название схемы.
    /// </summary>
    /// <param name="provider">Элемент перечисления ExternalLoginProvider.</param>
    /// <returns>Строковое имя схемы аутентификации (например, "VK ID").</returns>
    /// <exception cref="ArgumentOutOfRangeException">Выбрасывается, если передан неизвестный или неподдерживаемый провайдер.</exception>
    private static string GetProviderScheme(ExternalLoginProvider provider) => provider switch
    {
        ExternalLoginProvider.VkId => VkIdScheme,
        _ => throw new ArgumentOutOfRangeException("Неподдерживаемый провайдер внешнего входа.")
    };

    /// <summary>
    /// Вспомогательный метод для проверки результатов выполнения операций ASP.NET Core Identity.
    /// </summary>
    /// <param name="result">Объект IdentityResult, содержащий статус операции.</param>
    /// <exception cref="ExternalLoginException">Выбрасывается, если операция в Identity завершилась неудачей (содержит склеенный текст ошибок).</exception>
    private static void EnsureSucceeded(IdentityResult result)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join("; ",
            result.Errors.Select(error => error.Description));

        throw new ExternalLoginException($"Не удалось изменить способ входа: {errors}");
    }
}
