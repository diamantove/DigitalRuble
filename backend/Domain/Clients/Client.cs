using Domain.Common;
using Domain.Wallets;

namespace Domain.Clients;

public class Client
{
    private readonly List<Wallet> _wallets = [];

    public Client(string mid, string fullName)
    {
        if (string.IsNullOrWhiteSpace(mid))
            throw new ClientException("MID клиента обязателен.");

        if (string.IsNullOrWhiteSpace(fullName))
            throw new ClientException("ФИО клиента обязательно.");

        Id = Guid.NewGuid();
        Mid = mid;
        FullName = fullName;
    }

    public Guid Id { get; private set; }

    public string Mid { get; private set; } = null!;

    public string FullName { get; private set; } = null!;

    public string? DigitalRubleParticipantId { get; private set; }

    public IReadOnlyCollection<Wallet> Wallets => _wallets.AsReadOnly();

    public void SetDigitalRubleParticipantId(string participantId)
    {
        if (string.IsNullOrWhiteSpace(participantId))
            throw new ClientException("Идентификатор участника ЦР не может быть пустым.");

        DigitalRubleParticipantId = participantId;
    }

    public Wallet AddWallet(string code, WalletStatus status, string? accountNumber = null)
    {
        if (_wallets.Any(wallet => wallet.IsActive))
        {
            throw new ClientException("У клиента уже есть активный кошелёк.");
        }

        var wallet = new Wallet(code, status, accountNumber);
        _wallets.Add(wallet);

        return wallet;
    }

    public Wallet GetActiveWallet()
    {
        return _wallets.Single(wallet => wallet.IsActive);
    }
}
