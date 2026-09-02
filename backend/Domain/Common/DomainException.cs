namespace Domain.Common;

public abstract class DomainException : Exception
{
    public DomainException(string message) : base(message)
    {
    }
}