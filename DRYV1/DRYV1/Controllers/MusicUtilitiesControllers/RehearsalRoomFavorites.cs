using Microsoft.AspNetCore.Mvc;
using DRYV1.Data;
using DRYV1.Models.MusicUtilities;
using System.Threading.Tasks;
using DRYV1.Models;
using Microsoft.EntityFrameworkCore;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RehearsalRoomFavoritesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RehearsalRoomFavoritesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> AddFavorite(int userId, int rehearsalRoomId)
        {
            var favorite = new RehearsalRoomFavorites { UserId = userId, RehearsalRoomid = rehearsalRoomId };
            _context.RehearsalRoomFavorites.Add(favorite);

            var rehearsalRoom = await _context.RehearsalRooms.FindAsync(rehearsalRoomId);
            if (rehearsalRoom != null)
            {
                rehearsalRoom.FavoriteCount++;
            }

            await _context.SaveChangesAsync();
            return Ok(favorite);
        }

        [HttpDelete]
        public async Task<IActionResult> RemoveFavorite(int userId, int rehearsalRoomId)
        {
            var favorite = await _context.RehearsalRoomFavorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.RehearsalRoomid == rehearsalRoomId);
            if (favorite == null)
            {
                return NotFound("Favorite not found.");
            }

            _context.RehearsalRoomFavorites.Remove(favorite);

            var rehearsalRoom = await _context.RehearsalRooms.FindAsync(rehearsalRoomId);
            if (rehearsalRoom != null)
            {
                rehearsalRoom.FavoriteCount--;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetFavorites(int userId)
        {
            var favorites = await _context.RehearsalRoomFavorites
                .Where(f => f.UserId == userId)
                .Include(f => f.RehearsalRoom)
                .ToListAsync();

            return Ok(favorites);
        }
    }
}