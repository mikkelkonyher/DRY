using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DRYV1.Migrations
{
    /// <inheritdoc />
    public partial class v2 : Migration
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

            migrationBuilder.DropColumn(
                name: "Brand",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "Condition",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "ListingDate",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "Model",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "Brand",
                table: "Drums");

            migrationBuilder.DropColumn(
                name: "Condition",
                table: "Drums");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Drums");

            migrationBuilder.DropColumn(
                name: "ListingDate",
                table: "Drums");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Drums");

            migrationBuilder.DropColumn(
                name: "Model",
                table: "Drums");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Drums");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Drums");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "Drums");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Guitars",
                newName: "GuitarType");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Drums",
                newName: "DrumType");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Guitars",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Drums",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.CreateTable(
                name: "Instruments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ListingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Brand = table.Column<string>(type: "text", nullable: false),
                    Model = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    Condition = table.Column<string>(type: "text", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Instruments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Instruments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Instruments_UserId",
                table: "Instruments",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Drums_Instruments_Id",
                table: "Drums",
                column: "Id",
                principalTable: "Instruments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Guitars_Instruments_Id",
                table: "Guitars",
                column: "Id",
                principalTable: "Instruments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Drums_Instruments_Id",
                table: "Drums");

            migrationBuilder.DropForeignKey(
                name: "FK_Guitars_Instruments_Id",
                table: "Guitars");

            migrationBuilder.DropTable(
                name: "Instruments");

            migrationBuilder.RenameColumn(
                name: "GuitarType",
                table: "Guitars",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "DrumType",
                table: "Drums",
                newName: "Type");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Guitars",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<string>(
                name: "Brand",
                table: "Guitars",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Condition",
                table: "Guitars",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Guitars",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ListingDate",
                table: "Guitars",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Guitars",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "Guitars",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Guitars",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Guitars",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "Guitars",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Drums",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<string>(
                name: "Brand",
                table: "Drums",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Condition",
                table: "Drums",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Drums",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ListingDate",
                table: "Drums",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Drums",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "Drums",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Drums",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Drums",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "Drums",
                type: "integer",
                nullable: false,
                defaultValue: 0);

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
