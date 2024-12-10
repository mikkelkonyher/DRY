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
    public class ForumLikesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ForumLikesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> AddLike(int userId, int forumId)
        {
            var like = new ForumLikes { UserId = userId, ForumId = forumId };
            _context.ForumLikes.Add(like);

            var forum = await _context.Forums.FindAsync(forumId);
            if (forum != null)
            {
                forum.LikeCount++;
            }

            await _context.SaveChangesAsync();
            return Ok(like);
        }

        [HttpDelete]
        public async Task<IActionResult> RemoveLike(int userId, int forumId)
        {
            var like = await _context.ForumLikes
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ForumId == forumId);
            if (like == null)
            {
                return NotFound("Like not found.");
            }

            _context.ForumLikes.Remove(like);

            var forum = await _context.Forums.FindAsync(forumId);
            if (forum != null)
            {
                forum.LikeCount--;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetLikes(int userId)
        {
            var likes = await _context.ForumLikes
                .Where(f => f.UserId == userId)
                .Include(f => f.Forum)
                .ToListAsync();

            return Ok(likes);
        }
    }
}