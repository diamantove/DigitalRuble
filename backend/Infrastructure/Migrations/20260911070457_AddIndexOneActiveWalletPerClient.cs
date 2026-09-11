using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexOneActiveWalletPerClient : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Wallets_ClientId",
                table: "Wallets");

            migrationBuilder.CreateIndex(
                name: "IX_Wallets_ClientId_Active",
                table: "Wallets",
                column: "ClientId",
                unique: true,
                filter: "\"Status\" IN ('Prcs', 'Actv', 'Blck')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Wallets_ClientId_Active",
                table: "Wallets");

            migrationBuilder.CreateIndex(
                name: "IX_Wallets_ClientId",
                table: "Wallets",
                column: "ClientId");
        }
    }
}
