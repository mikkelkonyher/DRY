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

        public FavoritesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> AddFavorite(int userId, int musicGearId)
        {
            var favorite = new Favorite { UserId = userId, MusicGearId = musicGearId };
            _context.Favorites.Add(favorite);

            var musicGear = await _context.MusicGear.FindAsync(musicGearId);
            if (musicGear != null)
            {
                musicGear.FavoriteCount++;
            }

            await _context.SaveChangesAsync();
            return Ok(favorite);
        }

        [HttpDelete]
        public async Task<IActionResult> RemoveFavorite(int userId, int musicGearId)
        {
            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.MusicGearId == musicGearId);
            if (favorite == null)
            {
                return NotFound("Favorite not found.");
            }

            _context.Favorites.Remove(favorite);

            var musicGear = await _context.MusicGear.FindAsync(musicGearId);
            if (musicGear != null)
            {
                musicGear.FavoriteCount--;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetFavorites(int userId)
        {
            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.MusicGear)
                .ToListAsync();

            return Ok(favorites);
        }
    }
}