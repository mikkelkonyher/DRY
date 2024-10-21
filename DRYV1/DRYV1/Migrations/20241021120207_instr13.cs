using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DRYV1.Migrations
{
    /// <inheritdoc />
    public partial class instr13 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TypeofGuitar",
                table: "Guitars",
                newName: "Type");

            migrationBuilder.AddColumn<string>(
                name: "Condition",
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

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Guitars",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "Guitars",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Condition",
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

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Drums",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "Drums",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Condition",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "ListingDate",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "Guitars");

            migrationBuilder.DropColumn(
                name: "Condition",
                table: "Drums");

            migrationBuilder.DropColumn(
                name: "ListingDate",
                table: "Drums");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Drums");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Drums");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "Drums");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Guitars",
                newName: "TypeofGuitar");
        }
    }
}
