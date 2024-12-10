using DRYV1.Data;
using DRYV1.Models;
using DRYV1.Models.MusicUtilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CommentController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> PostComment([FromBody] CommentDTO commentDto)
        {
            if (commentDto == null)
            {
                return BadRequest("Comment is null.");
            }

            // Validate if the UserId exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == commentDto.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId.");
            }

            // Validate if the MusicGearId, RehearsalRoomId, or ForumId exists
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
                        Name = c.User.Name,
                        Email = c.User.Email
                    }
                })
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comment == null)
            {
                return NotFound();
            }

            return Ok(comment);
        }

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
                        Name = c.User.Name,
                        Email = c.User.Email
                    }
                })
                .ToListAsync();

            return Ok(comments);
        }

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
                        Name = c.User.Name,
                        Email = c.User.Email
                    }
                })
                .ToListAsync();

            return Ok(comments);
        }

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
                        Name = c.User.Name,
                        Email = c.User.Email
                    }
                })
                .ToListAsync();

            return Ok(comments);
        }
    }
}