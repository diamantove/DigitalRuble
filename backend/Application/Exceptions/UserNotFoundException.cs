namespace Application.Exceptions;

public class UserNotFoundException : NotFoundException
{
    public UserNotFoundException(Guid userId)
        : base($"Пользователь с идентификатором '{userId}' не найден.")
    {
    }
}
