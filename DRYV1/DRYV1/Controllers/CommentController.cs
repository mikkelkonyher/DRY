using DRYV1.Data;
using DRYV1.Models;
using DRYV1.Models.MusicUtilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Controllerens konstruktør, modtager databasekontekst via dependency injection
        public CommentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Opretter en ny kommentar til MusicGear, RehearsalRoom eller Forum
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> PostComment([FromBody] CommentDTO commentDto)
        {
            if (commentDto == null)
            {
                return BadRequest("Comment is null.");
            }

            // Tjekker om bruger eksisterer
            var userExists = await _context.Users.AnyAsync(u => u.Id == commentDto.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId.");
            }

            // Validerer at der er angivet et gyldigt objekt at kommentere på
            if (commentDto.MusicGearId.HasValue && commentDto.MusicGearId.Value > 0)
            {
                var musicGearExists = await _context.MusicGear.AnyAsync(mg => mg.Id == commentDto.MusicGearId.Value);
                if (!musicGearExists)
                {
                    return BadRequest("Invalid MusicGearId.");
                }
            }
            else if (commentDto.RehearsalRoomId.HasValue && commentDto.RehearsalRoomId.Value > 0)
            {
                var rehearsalRoomExists = await _context.RehearsalRooms.AnyAsync(rr => rr.Id == commentDto.RehearsalRoomId.Value);
                if (!rehearsalRoomExists)
                {
                    return BadRequest("Invalid RehearsalRoomId.");
                }
            }
            else if (commentDto.ForumId.HasValue && commentDto.ForumId.Value > 0)
            {
                var forumExists = await _context.Forums.AnyAsync(f => f.Id == commentDto.ForumId.Value);
                if (!forumExists)
                {
                    return BadRequest("Invalid ForumId.");
                }
            }
            else
            {
                return BadRequest("Either MusicGearId, RehearsalRoomId, or ForumId must be provided.");
            }

            // Opretter kommentar-objekt
            var comment = new Comment
            {
                MusicGearId = commentDto.MusicGearId.HasValue && commentDto.MusicGearId.Value > 0 ? commentDto.MusicGearId : null,
                RehearsalRoomId = commentDto.RehearsalRoomId.HasValue && commentDto.RehearsalRoomId.Value > 0 ? commentDto.RehearsalRoomId : null,
                ForumId = commentDto.ForumId.HasValue && commentDto.ForumId.Value > 0 ? commentDto.ForumId : null,
                UserId = commentDto.UserId,
                Text = commentDto.Text,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCommentById), new { id = comment.Id }, comment);
        }

        // Henter en kommentar baseret på id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCommentById(int id)
        {
            var comment = await _context.Comments
                .Include(c => c.User)
                .Select(c => new
                {
                    c.Id,
                    c.MusicGearId,
                    c.RehearsalRoomId,
                    c.ForumId,
                    c.UserId,
                    c.Text,
                    c.CreatedAt,
                    User = new UserDTO
                    {
                        Id = c.User.Id,
                        Name = c.User.Name
                    }
                })
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comment == null)
            {
                return NotFound();
            }

            return Ok(comment);
        }

        // Henter alle kommentarer til et bestemt MusicGear
        [HttpGet("api/MusicGear/{musicGearId}/comments")]
        public async Task<IActionResult> GetCommentsByMusicGearId(int musicGearId)
        {
            var comments = await _context.Comments
                .Where(c => c.MusicGearId == musicGearId)
                .Include(c => c.User)
                .Select(c => new
                {
                    c.Id,
                    c.MusicGearId,
                    c.UserId,
                    c.Text,
                    c.CreatedAt,
                    User = new UserDTO
                    {
                        Id = c.User.Id,
                        Name = c.User.Name
                    }
                })
                .ToListAsync();

            return Ok(comments);
        }

        // Henter alle kommentarer til et bestemt RehearsalRoom
        [HttpGet("api/RehearsalRoom/{rehearsalRoomId}/comments")]
        public async Task<IActionResult> GetCommentsByRehearsalRoomId(int rehearsalRoomId)
        {
            var comments = await _context.Comments
                .Where(c => c.RehearsalRoomId == rehearsalRoomId)
                .Include(c => c.User)
                .Select(c => new
                {
                    c.Id,
                    c.RehearsalRoomId,
                    c.UserId,
                    c.Text,
                    c.CreatedAt,
                    User = new UserDTO
                    {
                        Id = c.User.Id,
                        Name = c.User.Name
                    }
                })
                .ToListAsync();

            return Ok(comments);
        }

        // Henter alle kommentarer til et bestemt Forum
        [HttpGet("api/Forum/{forumId}/comments")]
        public async Task<IActionResult> GetCommentsByForumId(int forumId)
        {
            var comments = await _context.Comments
                .Where(c => c.ForumId == forumId)
                .Include(c => c.User)
                .Select(c => new
                {
                    c.Id,
                    c.ForumId,
                    c.UserId,
                    c.Text,
                    c.CreatedAt,
                    User = new UserDTO
                    {
                        Id = c.User.Id,
                        Name = c.User.Name
                    }
                })
                .ToListAsync();

            return Ok(comments);
        }
        
        // Sletter en kommentar baseret på id
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
            {
                return NotFound("Comment not found.");
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}