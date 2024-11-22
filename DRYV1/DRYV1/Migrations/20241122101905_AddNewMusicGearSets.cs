using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DRYV1.Migrations
{
    /// <inheritdoc />
    public partial class AddNewMusicGearSets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HornsGear",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    HornsGearType = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HornsGear", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HornsGear_MusicGear_Id",
                        column: x => x.Id,
                        principalTable: "MusicGear",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KeysGear",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    KeysGearType = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KeysGear", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KeysGear_MusicGear_Id",
                        column: x => x.Id,
                        principalTable: "MusicGear",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StringsGear",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    StringsGearType = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StringsGear", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StringsGear_MusicGear_Id",
                        column: x => x.Id,
                        principalTable: "MusicGear",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudioGear",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    StudioGearType = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudioGear", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudioGear_MusicGear_Id",
                        column: x => x.Id,
                        principalTable: "MusicGear",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HornsGear");

            migrationBuilder.DropTable(
                name: "KeysGear");

            migrationBuilder.DropTable(
                name: "StringsGear");

            migrationBuilder.DropTable(
                name: "StudioGear");
        }
    }
}
