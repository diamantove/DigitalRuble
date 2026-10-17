using Application.Abstractions.Data;
using Application.Exceptions;
using Application.Platform.Dto;
using Domain.Common;

namespace Application.Platform;

public sealed class PlatformWalletService(
        IClientRepository clientRepository,
        IWalletRepository walletRepository,
        IApplicationDbContext dbContext)
{
    public async Task SyncAsync(
        string mid,
        SyncWalletDto walletDto,
        CancellationToken cancellationToken)
    {
        var client = await clientRepository.GetByMidWithWalletsAsync(
            mid,
            cancellationToken);

        if (client is null)
        {
            throw new NotFoundException($"Клиент с MID '{mid}' не найден.");
        }

        var activeWallet = client.Wallets
            .SingleOrDefault(wallet => wallet.IsActive);

        if (activeWallet is null)
        {
            var walletCodeExists = await walletRepository.CodeExistsAsync(
                walletDto.WalletCode,
                cancellationToken);

            if (walletCodeExists)
                throw new WalletException($"Кошелёк с кодом '{walletDto.WalletCode}' уже существует.");

            if (walletDto.AccountNumber is not null)
            {
                await EnsureAccountNumberIsAvailableForWalletAsync(
                    walletDto.AccountNumber,
                    walletDto.WalletCode,
                    cancellationToken);
            }

            client.AddWallet(
                walletDto.WalletCode,
                walletDto.Status,
                walletDto.AccountNumber);
        }
        else
        {
            if (activeWallet.Code != walletDto.WalletCode)
                throw new WalletException("Переданный код кошелька не совпадает с кодом активного кошелька.");

            if (activeWallet.Status != walletDto.Status)
                activeWallet.ChangeStatus(walletDto.Status);

            if (walletDto.AccountNumber is not null)
            {
                await EnsureAccountNumberIsAvailableForWalletAsync(
                    walletDto.AccountNumber,
                    activeWallet.Code,
                    cancellationToken);

                activeWallet.SetAccountNumber(walletDto.AccountNumber);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        string walletCode,
        UpdateWalletDto request,
        CancellationToken cancellationToken)
    {
        var wallet = await walletRepository.GetByCodeAsync(
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
            await EnsureAccountNumberIsAvailableForWalletAsync(request.AccountNumber, wallet.Code, cancellationToken);

            wallet.SetAccountNumber(request.AccountNumber);
        }

        await dbContext.SaveChangesAsync(cancellationToken); 
    }

    private async Task EnsureAccountNumberIsAvailableForWalletAsync(
        string accountNumber,
        string excludingWalletCode,
        CancellationToken cancellationToken)
    {
        var accountNumberExists = await walletRepository.AccountNumberExistsForAnotherWalletAsync(
            accountNumber,
            excludingWalletCode,
            cancellationToken);

        if (accountNumberExists)
        {
            throw new WalletException(
                $"Номер счёта '{accountNumber}' уже назначен другому кошельку.");
        }
    }
}
