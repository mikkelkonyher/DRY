using DRYV1.Controllers;
using Microsoft.EntityFrameworkCore;
using DRYV1.Models;

namespace DRYV1.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Define your DbSets here
        public DbSet<User> Users { get; set; } 
        public DbSet<Guitar> Guitars { get; set; }
        public DbSet<Drums> Drums { get; set; }
    }
}