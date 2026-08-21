namespace Domain.Common;

public class WalletException : DomainException
{
    public WalletException(string message) : base(message)
    {
    }
}