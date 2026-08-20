using Domain.Wallets;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public sealed class WalletConfiguration : IEntityTypeConfiguration<Wallet>
{
    public void Configure(EntityTypeBuilder<Wallet> builder)
    {
        builder.HasKey(wallet => wallet.Id);

        builder.Property(wallet => wallet.ClientId)
            .IsRequired();

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
    }
}
