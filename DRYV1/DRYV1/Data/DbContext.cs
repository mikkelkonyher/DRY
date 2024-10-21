using DRYV1.Models;
using Microsoft.EntityFrameworkCore;

namespace DRYV1.Data
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Instrument> Instruments { get; set; }
        public DbSet<Guitar> Guitars { get; set; }
        
        public DbSet<Drums> Drums { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Instrument>().ToTable("Instruments");
            modelBuilder.Entity<Guitar>().ToTable("Guitars");
            modelBuilder.Entity<Drums>().ToTable("Drums");
        }
    }
}