using Application.Abstractions.Users.Dto;

namespace Application.Abstractions.Auth;

public interface IUserAuthenticationService
{
    Task<bool> SignInAsync(string email, string password);

    Task SignOutAsync();

    Task<CurrentUserDto?> GetCurrentUserAsync(Guid userId);
}