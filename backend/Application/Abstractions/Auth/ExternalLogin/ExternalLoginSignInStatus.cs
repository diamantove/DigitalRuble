namespace Application.Abstractions.Auth.ExternalLogin;

public enum ExternalLoginSignInStatus
{
    Succeeded,
    NotLinked,
    Failed,
    Blocked
}
