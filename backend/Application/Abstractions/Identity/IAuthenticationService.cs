using Application.Identity;

namespace Application.Abstractions.Identity;

public interface IAuthenticationService
{
    Task<bool> SignInAsync(string email, string password);

    Task SignOutAsync();

    Task<CurrentUserDto?> GetCurrentUserAsync(Guid userId);
}