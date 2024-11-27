using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DRYV1.Migrations
{
    /// <inheritdoc />
    public partial class AddRehearsalRoomToComment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_MusicGear_MusicGearId",
                table: "Comments");

            migrationBuilder.AlterColumn<int>(
                name: "MusicGearId",
                table: "Comments",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_MusicGear_MusicGearId",
                table: "Comments",
                column: "MusicGearId",
                principalTable: "MusicGear",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_MusicGear_MusicGearId",
                table: "Comments");

            migrationBuilder.AlterColumn<int>(
                name: "MusicGearId",
                table: "Comments",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_MusicGear_MusicGearId",
                table: "Comments",
                column: "MusicGearId",
                principalTable: "MusicGear",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
