namespace Application.Exceptions;

public sealed class PersistenceConflictException : Exception
{
    public PersistenceConflictException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}