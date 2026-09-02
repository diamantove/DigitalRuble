using Domain.Clients;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public sealed class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.HasKey(client => client.Id);

        builder.Property(client => client.Id)
            .ValueGeneratedNever();

        builder.Property(client => client.Mid)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(client => client.Mid)
            .IsUnique();

        builder.Property(client => client.FullName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(client => client.DigitalRubleParticipantId)
            .HasMaxLength(100);

        builder.HasIndex(client => client.DigitalRubleParticipantId)
            .IsUnique();

        builder.HasMany(client => client.Wallets)
            .WithOne()
            .HasForeignKey(wallet => wallet.ClientId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
