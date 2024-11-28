using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DRYV1.Migrations
{
    /// <inheritdoc />
    public partial class AddRehearsalRoomsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_RehearsalRooms_UserId",
                table: "RehearsalRooms",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_RehearsalRooms_Users_UserId",
                table: "RehearsalRooms",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RehearsalRooms_Users_UserId",
                table: "RehearsalRooms");

            migrationBuilder.DropIndex(
                name: "IX_RehearsalRooms_UserId",
                table: "RehearsalRooms");
        }
    }
}
