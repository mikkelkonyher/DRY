using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DRYV1.Migrations
{
    /// <inheritdoc />
    public partial class AddRehearsalRoom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RehearsalRoomId",
                table: "Comments",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RehearsalRooms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    ListingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    PaymentType = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    RoomSize = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    FavoriteCount = table.Column<int>(type: "integer", nullable: false),
                    ImagePaths = table.Column<List<string>>(type: "text[]", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RehearsalRooms", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comments_RehearsalRoomId",
                table: "Comments",
                column: "RehearsalRoomId");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_RehearsalRooms_RehearsalRoomId",
                table: "Comments",
                column: "RehearsalRoomId",
                principalTable: "RehearsalRooms",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_RehearsalRooms_RehearsalRoomId",
                table: "Comments");

            migrationBuilder.DropTable(
                name: "RehearsalRooms");

            migrationBuilder.DropIndex(
                name: "IX_Comments_RehearsalRoomId",
                table: "Comments");

            migrationBuilder.DropColumn(
                name: "RehearsalRoomId",
                table: "Comments");
        }
    }
}
