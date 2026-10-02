namespace Application.Exceptions;

public sealed class UserAlreadyExistsException : Exception
{
    public UserAlreadyExistsException(string email)
        : base($"Пользователь с email '{email}' уже существует.")
    {
    }
}
