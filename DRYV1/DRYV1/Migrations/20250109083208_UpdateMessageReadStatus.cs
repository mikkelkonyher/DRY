using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DRYV1.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMessageReadStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsRead",
                table: "Messages",
                newName: "IsReadSender");

            migrationBuilder.AddColumn<bool>(
                name: "IsReadReceiver",
                table: "Messages",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsReadReceiver",
                table: "Messages");

            migrationBuilder.RenameColumn(
                name: "IsReadSender",
                table: "Messages",
                newName: "IsRead");
        }
    }
}
