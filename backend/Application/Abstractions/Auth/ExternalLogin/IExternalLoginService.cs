namespace Application.Abstractions.Auth.ExternalLogin;

public interface IExternalLoginService
{
    Task LinkAsync(Guid userId, ExternalLoginProvider provider);

    Task<ExternalLoginSignInResult> SignInAsync(ExternalLoginProvider provider);

    Task UnlinkAsync(Guid userId, ExternalLoginProvider provider);
}
