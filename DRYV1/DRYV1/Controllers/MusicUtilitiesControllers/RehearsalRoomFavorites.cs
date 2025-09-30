using Microsoft.AspNetCore.Mvc;
using DRYV1.Data;
using DRYV1.Models.MusicUtilities;
using System.Threading.Tasks;
using DRYV1.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RehearsalRoomFavoritesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Controller constructor, modtager databasekontekst via dependency injection
        public RehearsalRoomFavoritesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Tilføjer et øvelokale til brugerens favoritter
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddFavorite(int userId, int rehearsalRoomId)
        {
            // Opretter favorit-objekt og tilføjer til databasen
            var favorite = new RehearsalRoomFavorites { UserId = userId, RehearsalRoomid = rehearsalRoomId };
            _context.RehearsalRoomFavorites.Add(favorite);

            // Opdaterer favorit-tælleren på det relevante øvelokale
            var rehearsalRoom = await _context.RehearsalRooms.FindAsync(rehearsalRoomId);
            if (rehearsalRoom != null)
            {
                rehearsalRoom.FavoriteCount++;
            }

            await _context.SaveChangesAsync();
            return Ok(favorite);
        }

        // Fjerner et øvelokale fra brugerens favoritter
        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> RemoveFavorite(int userId, int rehearsalRoomId)
        {
            // Finder favorit-objektet i databasen
            var favorite = await _context.RehearsalRoomFavorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.RehearsalRoomid == rehearsalRoomId);
            if (favorite == null)
            {
                return NotFound("Favorite not found.");
            }

            // Fjerner favorit og opdaterer favorit-tælleren
            _context.RehearsalRoomFavorites.Remove(favorite);

            var rehearsalRoom = await _context.RehearsalRooms.FindAsync(rehearsalRoomId);
            if (rehearsalRoom != null)
            {
                rehearsalRoom.FavoriteCount--;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Henter alle favoritter for en bruger, sorteret nyeste først
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetFavorites(int userId)
        {
            var favorites = await _context.RehearsalRoomFavorites
                .Where(f => f.UserId == userId)
                .Include(f => f.RehearsalRoom) // Henter relateret øvelokale-data
                .OrderByDescending(f => f.Id) // Sorterer så nyeste favoritter kommer først
                .ToListAsync();

            return Ok(favorites);
        }
    }
}