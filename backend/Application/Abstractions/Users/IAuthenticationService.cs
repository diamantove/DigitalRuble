using Application.Abstractions.Users.Dto;

namespace Application.Abstractions.Users;

public interface IAuthenticationService
{
    Task<bool> SignInAsync(string email, string password);

    Task SignOutAsync();

    Task<CurrentUserDto?> GetCurrentUserAsync(Guid userId);
}