using Microsoft.AspNetCore.Mvc;
using DRYV1.Data;
using DRYV1.Models;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Controllerens konstruktør, modtager databasekontekst via dependency injection
        public FavoritesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Tilføjer et MusicGear til brugerens favoritter
        [HttpPost]
        public async Task<IActionResult> AddFavorite(int userId, int musicGearId)
        {
            // Opretter favorit-objekt og tilføjer til databasen
            var favorite = new Favorite { UserId = userId, MusicGearId = musicGearId };
            _context.Favorites.Add(favorite);

            // Opdaterer favorit-tælleren på det relevante MusicGear
            var musicGear = await _context.MusicGear.FindAsync(musicGearId);
            if (musicGear != null)
            {
                musicGear.FavoriteCount++;
            }

            await _context.SaveChangesAsync();
            return Ok(favorite);
        }

        // Fjerner et MusicGear fra brugerens favoritter
        [HttpDelete]
        public async Task<IActionResult> RemoveFavorite(int userId, int musicGearId)
        {
            // Finder favorit-objektet i databasen
            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.MusicGearId == musicGearId);
            if (favorite == null)
            {
                return NotFound("Favorite not found.");
            }

            // Fjerner favorit og opdaterer favorit-tælleren
            _context.Favorites.Remove(favorite);

            var musicGear = await _context.MusicGear.FindAsync(musicGearId);
            if (musicGear != null)
            {
                musicGear.FavoriteCount--;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Henter alle favoritter for en bruger, sorteret nyeste først
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetFavorites(int userId)
        {
            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.MusicGear) // Henter relateret MusicGear-data
                .OrderByDescending(f => f.MusicGearId) // Sorterer så nyeste favoritter kommer først
                .ToListAsync();

            return Ok(favorites);
        }
    }
}