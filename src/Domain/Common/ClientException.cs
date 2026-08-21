namespace Domain.Common;

public class ClientException : DomainException
{
    public ClientException(string message) : base(message)
    {
    }
}