using Domain.Common;

namespace Domain.Wallets;

public class Wallet
{
    private Wallet()
    {
    }

    public Wallet(string code, WalletStatus status, string? accountNumber = null)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new WalletException("Код кошелька обязателен.");

        if (status == WalletStatus.Clsd)
            throw new WalletException("Нельзя создать кошелёк сразу в статусе Clsd.");

        if (status is not (
                WalletStatus.Prcs
                or WalletStatus.Actv
                or WalletStatus.Blck))
        {
            throw new WalletException(
                "При создании допустимы только статусы Prcs, Actv и Blck.");
        }

        Id = Guid.NewGuid();
        Code = code;
        Status = status;

        if (!string.IsNullOrWhiteSpace(accountNumber))
            AccountNumber = accountNumber;
    }

    public Guid Id { get; private set; }

    public Guid ClientId { get; private set; }

    public string Code { get; private set; } = null!;

    public WalletStatus Status { get; private set; }

    public string? AccountNumber { get; private set; }

    public bool IsActive => Status is WalletStatus.Prcs or WalletStatus.Actv or WalletStatus.Blck;

    public void ChangeStatus(WalletStatus newStatus)
    {
        var isAllowed = (Status, newStatus) switch
        {
            (WalletStatus.Prcs, WalletStatus.Actv) => true,
            (WalletStatus.Actv, WalletStatus.Blck) => true,
            (WalletStatus.Blck, WalletStatus.Actv) => true,
            (WalletStatus.Blck, WalletStatus.Clsd) => true,
            _ => false
        };

        if (!isAllowed)
        {
            throw new WalletException($"Переход статуса из {Status} в {newStatus} недопустим.");
        }

        Status = newStatus;
    }

    public void SetAccountNumber(string accountNumber)
    {
        if (string.IsNullOrWhiteSpace(accountNumber))
            throw new WalletException("Номер счёта не может быть пустым.");

        if (AccountNumber is null)
        {
            AccountNumber = accountNumber;
            return;
        }

        if (AccountNumber != accountNumber)
        {
            throw new WalletException("Номер счёта уже установлен и не может быть изменён.");
        }
    }
}