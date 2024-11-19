using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DRYV1.Migrations
{
    /// <inheritdoc />
    public partial class AddFavoriteModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Favorites_MusicGearId",
                table: "Favorites",
                column: "MusicGearId");

            migrationBuilder.AddForeignKey(
                name: "FK_Favorites_MusicGear_MusicGearId",
                table: "Favorites",
                column: "MusicGearId",
                principalTable: "MusicGear",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Favorites_MusicGear_MusicGearId",
                table: "Favorites");

            migrationBuilder.DropIndex(
                name: "IX_Favorites_MusicGearId",
                table: "Favorites");
        }
    }
}
