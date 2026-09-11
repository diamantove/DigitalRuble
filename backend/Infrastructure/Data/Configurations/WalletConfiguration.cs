using Domain.Wallets;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public sealed class WalletConfiguration : IEntityTypeConfiguration<Wallet>
{
    public void Configure(EntityTypeBuilder<Wallet> builder)
    {
        builder.HasKey(wallet => wallet.Id);

        builder.Property(wallet => wallet.Id)
            .ValueGeneratedNever();

        builder.Property(wallet => wallet.ClientId)
            .IsRequired();

        builder.HasIndex(wallet => wallet.ClientId)
            .HasDatabaseName("IX_Wallets_ClientId_Active")
            .IsUnique()
            .HasFilter("\"Status\" IN ('Prcs', 'Actv', 'Blck')");

        builder.Property(wallet => wallet.Code)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(wallet => wallet.Code)
            .IsUnique();

        builder.Property(wallet => wallet.Status)
            .HasConversion<string>()
            .HasMaxLength(4)
            .IsRequired();

        builder.Property(wallet => wallet.AccountNumber)
            .HasMaxLength(20);

        builder.HasIndex(wallet => wallet.AccountNumber)
            .IsUnique();
    }
}
