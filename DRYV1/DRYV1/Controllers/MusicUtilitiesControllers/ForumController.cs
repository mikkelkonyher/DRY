using Microsoft.AspNetCore.Mvc;
using DRYV1.Data;
using DRYV1.Models.MusicUtilities;
using Microsoft.EntityFrameworkCore;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ForumController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ForumController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            int pageNumber = 1, 
            int pageSize = 10, 
            string query = null)
        {
            var queryable = _context.Forums.AsQueryable();

            if (!string.IsNullOrEmpty(query))
            {
                var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                queryable = queryable.Where(f => keywords.All(k => f.Subject.ToLower().Contains(k) ||
                                                                   f.Body.ToLower().Contains(k)));
            }

            var totalItems = await queryable.CountAsync();
            var forums = await queryable
                .OrderByDescending(f => f.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new
            {
                TotalItems = totalItems,
                Items = forums
            };

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var forum = await _context.Forums.FindAsync(id);
            if (forum == null)
            {
                return NotFound();
            }

            var response = new
            {
                TotalItems = 1,
                Items = new List<Forum> { forum }
            };

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] Forum forum)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == forum.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId");
            }

            forum.CreatedAt = DateTime.UtcNow;

            _context.Forums.Add(forum);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = forum.Id }, forum);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var forum = await _context.Forums.FindAsync(id);
            if (forum == null)
            {
                return NotFound("Forum not found.");
            }

            _context.Forums.Remove(forum);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ForumUpdateDTO updatedForum)
        {
            if (id != updatedForum.Id)
            {
                return BadRequest("Forum ID mismatch.");
            }

            var forum = await _context.Forums.FindAsync(id);
            if (forum == null)
            {
                return NotFound("Forum not found.");
            }

            if (!string.IsNullOrEmpty(updatedForum.Subject))
            {
                forum.Subject = updatedForum.Subject;
            }

            if (!string.IsNullOrEmpty(updatedForum.Body))
            {
                forum.Body = updatedForum.Body;
            }

            _context.Forums.Update(forum);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}