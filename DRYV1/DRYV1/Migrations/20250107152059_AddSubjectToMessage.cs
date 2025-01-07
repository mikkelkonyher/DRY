using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DRYV1.Migrations
{
    /// <inheritdoc />
    public partial class AddSubjectToMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            

            migrationBuilder.AddColumn<string>(
                name: "subject",
                table: "Messages",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "subject",
                table: "Messages");

            migrationBuilder.AddColumn<bool>(
                name: "Read",
                table: "Messages",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
