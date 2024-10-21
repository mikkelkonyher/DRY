using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DRYV1.Migrations
{
    /// <inheritdoc />
    public partial class instr7 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Drums_Users_UserId",
                table: "Drums");

            migrationBuilder.DropForeignKey(
                name: "FK_Guitars_Users_UserId",
                table: "Guitars");

            migrationBuilder.DropIndex(
                name: "IX_Guitars_UserId",
                table: "Guitars");

            migrationBuilder.DropIndex(
                name: "IX_Drums_UserId",
                table: "Drums");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Guitars_UserId",
                table: "Guitars",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Drums_UserId",
                table: "Drums",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Drums_Users_UserId",
                table: "Drums",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Guitars_Users_UserId",
                table: "Guitars",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
