using Application.Abstractions.Data;
using Application.Exceptions;
using Domain.Common;
using Domain.Wallets;

namespace Application.Platform;

public sealed class PlatformWalletService
{
    private readonly IClientRepository _clientRepository;
    private readonly IWalletRepository _walletRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PlatformWalletService(
        IClientRepository clientRepository,
        IWalletRepository walletRepository,
        IUnitOfWork unitOfWork)
    {
        _clientRepository = clientRepository;
        _walletRepository = walletRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task SyncAsync(
        SyncWalletRequest request,
        CancellationToken cancellationToken)
    {
        var client = await _clientRepository.GetByMidWithWalletsAsync(
            request.Mid,
            cancellationToken);

        if (client is null)
        {
            throw new NotFoundException($"Клиент с MID '{request.Mid}' не найден.");
        }

        var participantIdIsUsed = await _clientRepository.DigitalRubleParticipantIdExistsForAnotherClientAsync(
                request.DigitalRubleParticipantId,
                client.Id,
                cancellationToken);

        if (participantIdIsUsed)
        {
            throw new ClientException("Идентификатор участника ЦР уже назначен другому клиенту.");
        }

        client.SetDigitalRubleParticipantId(
            request.DigitalRubleParticipantId);

        var activeWallet = client.Wallets
            .SingleOrDefault(wallet => wallet.IsActive);

        if (activeWallet is null)
        {
            var walletCodeExists = await _walletRepository.CodeExistsAsync(
                request.WalletCode,
                cancellationToken);

            if (walletCodeExists)
            {
                throw new WalletException($"Кошелёк с кодом '{request.WalletCode}' уже существует.");
            }

            client.AddWallet(
                request.WalletCode,
                request.Status,
                request.AccountNumber);
        }
        else
        {
            if (activeWallet.Code != request.WalletCode)
            {
                throw new WalletException("Код активного кошелька не совпадает с кодом, переданным платформой.");
            }

            if (activeWallet.Status != request.Status)
            {
                activeWallet.ChangeStatus(request.Status);
            }

            if (request.AccountNumber is not null)
            {
                await EnsureAccountNumberIsAvailableAsync(request.AccountNumber, cancellationToken);

                activeWallet.SetAccountNumber(request.AccountNumber);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        string walletCode,
        UpdateWalletRequest request,
        CancellationToken cancellationToken)
    {
        var wallet = await _walletRepository.GetByCodeAsync(
            walletCode,
            cancellationToken);

        if (wallet is null)
        {
            throw new NotFoundException($"Кошелёк с кодом '{walletCode}' не найден.");
        }

        if (request.Status is { } status && wallet.Status != status)
        {
            wallet.ChangeStatus(status);
        }

        if (request.AccountNumber is not null)
        {
            await EnsureAccountNumberIsAvailableAsync(request.AccountNumber, cancellationToken);

            wallet.SetAccountNumber(request.AccountNumber);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken); 
    }

    private async Task EnsureAccountNumberIsAvailableAsync(
        string accountNumber,
        CancellationToken cancellationToken)
    {
        var accountNumberExists = await _walletRepository.AccountNumberExistsAsync(
            accountNumber,
            cancellationToken);

        if (accountNumberExists)
        {
            throw new WalletException(
                $"Номер счёта '{accountNumber}' уже назначен другому кошельку.");
        }
    }
}
