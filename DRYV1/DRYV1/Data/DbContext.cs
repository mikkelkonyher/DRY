using DRYV1.Models;
using DRYV1.Models.MusicUtilities;
using Microsoft.EntityFrameworkCore;

namespace DRYV1.Data
{
    // Databasekontekst for applikationen, håndterer alle entiteter og deres tabeller
    public class ApplicationDbContext : DbContext
    {
        // DbSet for brugere
        public DbSet<User> Users { get; set; }
        // DbSet for forskellige typer musikudstyr
        public DbSet<MusicGear> MusicGear { get; set; }
        public DbSet<GuitBassGear> GuitBassGear { get; set; }
        public DbSet<DrumsGear> DrumsGear { get; set; }
        public DbSet<StudioGear> StudioGear { get; set; }
        public DbSet<KeysGear> KeysGear { get; set; }
        public DbSet<HornsGear> HornsGear { get; set; }
        public DbSet<StringsGear> StringsGear { get; set; }
        // DbSet for kommentarer, favoritter, øvelokaler, fora, beskeder og chats
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Favorite> Favorites { get; set; } 
        public DbSet<RehearsalRoom> RehearsalRooms { get; set; }
        public DbSet<RehearsalRoomFavorites> RehearsalRoomFavorites { get; set; }
        public DbSet<Forum> Forums { get; set; }
        public DbSet<ForumLikes> ForumLikes { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Chat> Chats { get; set; }

        // Konstruktør modtager DbContextOptions via dependency injection
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Konfigurerer entiteter og deres tilknyttede tabeller
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Angiver tabelnavne for de forskellige gear-typer
            modelBuilder.Entity<MusicGear>().ToTable("MusicGear");
            modelBuilder.Entity<GuitBassGear>().ToTable("GuitBassGear");
            modelBuilder.Entity<DrumsGear>().ToTable("DrumsGear");
            modelBuilder.Entity<StudioGear>().ToTable("StudioGear");
            modelBuilder.Entity<KeysGear>().ToTable("KeysGear");
            modelBuilder.Entity<HornsGear>().ToTable("HornsGear");
            modelBuilder.Entity<StringsGear>().ToTable("StringsGear");
        }
    }
}