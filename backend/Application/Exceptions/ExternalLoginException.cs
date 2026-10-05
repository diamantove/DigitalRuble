namespace Application.Exceptions;

public sealed class ExternalLoginException : Exception
{
    public ExternalLoginException(string message)
        : base(message)
    {
    }
}