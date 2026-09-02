using Domain.Clients;
using Domain.Wallets;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(
        ApplicationDbContext dbContext,
        CancellationToken cancellationToken)
    {
        await dbContext.Database.MigrateAsync(cancellationToken);

        if (await dbContext.Clients.AnyAsync(cancellationToken))
            return;

        var ivanov = new Client("MID-001", "Иванов Иван Иванович");
        ivanov.SetDigitalRubleParticipantId("DRPARTICIPANT-001");
        ivanov.AddWallet("WALLET-001", WalletStatus.Actv, "41111110000000000001");

        var petrova = new Client("MID-002", "Петрова Анна Сергеевна");
        petrova.AddWallet("WALLET-002", WalletStatus.Prcs);

        var sidorov = new Client("MID-003", "Сидоров Алексей Олегович");
        sidorov.SetDigitalRubleParticipantId("DRPARTICIPANT-003");

        var closedWallet = sidorov.AddWallet("WALLET-003-OLD", WalletStatus.Blck, "41111110000000000003");
        closedWallet.ChangeStatus(WalletStatus.Clsd);

        sidorov.AddWallet("WALLET-003", WalletStatus.Actv);

        var smirnova = new Client("MID-004", "Смирнова Елена Викторовна");

        await dbContext.Clients.AddRangeAsync(
            [ivanov, petrova, sidorov, smirnova],
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
