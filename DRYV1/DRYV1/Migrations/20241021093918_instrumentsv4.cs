using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DRYV1.Migrations
{
    /// <inheritdoc />
    public partial class instrumentsv4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Instruments_Users_UserId",
                table: "Instruments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Instruments",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "Discriminator",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "DrumKitSize",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "PickupType",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Instruments");

            migrationBuilder.DropColumn(
                name: "TypeOfDrums",
                table: "Instruments");

            migrationBuilder.RenameTable(
                name: "Instruments",
                newName: "Guitars");

            migrationBuilder.RenameColumn(
                name: "TypeOfGuitar",
                table: "Guitars",
                newName: "TypeofGuitar");

            migrationBuilder.RenameIndex(
                name: "IX_Instruments_UserId",
                table: "Guitars",
                newName: "IX_Guitars_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "TypeofGuitar",
                table: "Guitars",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Guitars",
                table: "Guitars",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Drums",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Brand = table.Column<string>(type: "text", nullable: false),
                    Model = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drums", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Drums_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Drums_UserId",
                table: "Drums",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Guitars_Users_UserId",
                table: "Guitars",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Guitars_Users_UserId",
                table: "Guitars");

            migrationBuilder.DropTable(
                name: "Drums");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Guitars",
                table: "Guitars");

            migrationBuilder.RenameTable(
                name: "Guitars",
                newName: "Instruments");

            migrationBuilder.RenameColumn(
                name: "TypeofGuitar",
                table: "Instruments",
                newName: "TypeOfGuitar");

            migrationBuilder.RenameIndex(
                name: "IX_Guitars_UserId",
                table: "Instruments",
                newName: "IX_Instruments_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "TypeOfGuitar",
                table: "Instruments",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "Discriminator",
                table: "Instruments",
                type: "character varying(13)",
                maxLength: 13,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DrumKitSize",
                table: "Instruments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PickupType",
                table: "Instruments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Instruments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TypeOfDrums",
                table: "Instruments",
                type: "text",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Instruments",
                table: "Instruments",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Instruments_Users_UserId",
                table: "Instruments",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
