using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DRYV1.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSubjectFromMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "subject",
                table: "Messages");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "subject",
                table: "Messages",
                type: "text",
                nullable: true);
        }
    }
}
