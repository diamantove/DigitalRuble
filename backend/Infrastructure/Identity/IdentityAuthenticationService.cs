using Application.Abstractions.Auth;
using Application.Abstractions.Users;
using Application.Abstractions.Users.Dto;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Identity;

public sealed class IdentityAuthenticationService(
    UserManager<CustomIdentityUser> userManager,
    SignInManager<CustomIdentityUser> signInManager)
    : IUserAuthenticationService
{
    public async Task<bool> SignInAsync(string email, string password)
    {
        var user = await userManager.FindByEmailAsync(email);

        if (user is null)
        {
            return false;
        }

        var result = await signInManager.PasswordSignInAsync(
            user,
            password,
            isPersistent: false,
            lockoutOnFailure: true);

        return result.Succeeded;
    }

    public Task SignOutAsync()
    {
        return signInManager.SignOutAsync();
    }

    public async Task<CurrentUserDto?> GetCurrentUserAsync(Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());

        if (user is null)
        {
            return null;
        }

        var roles = await userManager.GetRolesAsync(user);

        return new CurrentUserDto(
            user.Id,
            user.Email ?? string.Empty,
            user.DisplayName,
            roles.ToArray());
    }
}