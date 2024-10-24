using DRYV1.Data;
using DRYV1.Models;
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

            // Validate if the MusicGearId exists
            var musicGearExists = await _context.MusicGear.AnyAsync(mg => mg.Id == commentDto.MusicGearId);
            if (!musicGearExists)
            {
                return BadRequest("Invalid MusicGearId.");
            }

            var comment = new Comment
            {
                MusicGearId = commentDto.MusicGearId,
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
    }
}