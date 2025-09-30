using Microsoft.AspNetCore.Mvc;
using DRYV1.Data;
using DRYV1.Models.MusicUtilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ForumController : ControllerBase
    {
        // Databasekontekst til adgang af data
        private readonly ApplicationDbContext _context;

        public ForumController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Hent alle forumindlæg med mulighed for søgning og paginering
        [HttpGet]
        public async Task<IActionResult> GetAll(
            int pageNumber = 1, 
            int pageSize = 16, 
            string query = null)
        {
            var queryable = _context.Forums.AsQueryable();

            // Hvis der er en søgeforespørgsel, filtrer resultaterne
            if (!string.IsNullOrEmpty(query))
            {
                var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                queryable = queryable.Where(f => keywords.All(k => f.Subject.ToLower().Contains(k) ||
                                                                   f.Body.ToLower().Contains(k) ||
                                                                   _context.Users
                                                                       .Where(u => u.Name.ToLower().Contains(k))
                                                                       .Select(u => u.Id)
                                                                       .Contains(f.UserId)));
            }

            // Optæl det samlede antal resultater
            var totalItems = await queryable.CountAsync();

            // Hent den aktuelle side af forumindlæg
            var forums = await queryable
                .OrderByDescending(f => f.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(f => new
                {
                    f.Id,
                    f.Subject,
                    f.Body,
                    f.CreatedAt,
                    f.UserId,
                    // Hent brugernavn for forfatteren
                    UserName = _context.Users.Where(u => u.Id == f.UserId).Select(u => u.Name).FirstOrDefault(),
                    f.LikeCount
                })
                .ToListAsync();

            var response = new
            {
                TotalItems = totalItems,
                Items = forums
            };

            return Ok(response);
        }

        // Hent et enkelt forumindlæg baseret på ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var forum = await _context.Forums
                .Where(f => f.Id == id)
                .Select(f => new
                {
                    f.Id,
                    f.Subject,
                    f.Body,
                    f.CreatedAt,
                    f.UserId,
                    UserName = _context.Users.Where(u => u.Id == f.UserId).Select(u => u.Name).FirstOrDefault(),
                    f.LikeCount
                })
                .FirstOrDefaultAsync();

            if (forum == null)
            {
                return NotFound();
            }

            var response = new
            {
                TotalItems = 1,
                Items = new List<object> { forum }
            };

            return Ok(response);
        }

        // Opret et nyt forumindlæg
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromForm] Forum forum)
        {
            // Tjek om brugeren eksisterer
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

        // Slet et forumindlæg og tilhørende kommentarer
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var forum = await _context.Forums.FindAsync(id);
            if (forum == null)
            {
                return NotFound("Forum not found.");
            }

            // Find og slet alle kommentarer tilknyttet forumindlægget
            var comments = await _context.Comments.Where(c => c.ForumId == id).ToListAsync();
            _context.Comments.RemoveRange(comments);

            _context.Forums.Remove(forum);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Opdater et eksisterende forumindlæg
        [HttpPut("update/{id}")]
        [Authorize]
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

            // Opdater kun felter, hvis de er angivet
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
        
        // Hent alle forumindlæg oprettet af en bestemt bruger
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var forums = await _context.Forums
                .Where(f => f.UserId == userId)
                .Select(f => new
                {
                    f.Id,
                    f.Subject,
                    f.Body,
                    f.CreatedAt,
                    f.UserId,
                    UserName = _context.Users.Where(u => u.Id == f.UserId).Select(u => u.Name).FirstOrDefault(),
                    f.LikeCount
                })
                .ToListAsync();

            if (forums == null || !forums.Any())
            {
                return NotFound("No forums found for the specified user.");
            }

            return Ok(forums);
        }

        // Hent alle forumindlæg, som en bruger har liket
        [HttpGet("liked/{userId}")]
        public async Task<IActionResult> GetLikedForums(int userId)
        {
            var likedForums = await _context.ForumLikes
                .Where(fl => fl.UserId == userId)
                .Include(fl => fl.Forum)
                .Select(fl => new
                {
                    fl.Forum.Id,
                    fl.Forum.Subject,
                    fl.Forum.Body,
                    fl.Forum.CreatedAt,
                    fl.Forum.UserId,
                    UserName = _context.Users.Where(u => u.Id == fl.Forum.UserId).Select(u => u.Name).FirstOrDefault(),
                    fl.Forum.LikeCount
                })
                .ToListAsync();

            if (likedForums == null || !likedForums.Any())
            {
                return NotFound("No liked forums found for the specified user.");
            }

            return Ok(likedForums);
        }
        
        [HttpGet("forum/{forumId}/count")]
        public async Task<IActionResult> GetCommentCountByForumId(int forumId)
        {
            var count = await _context.Comments.CountAsync(c => c.ForumId == forumId);
            return Ok(new { ForumId = forumId, CommentCount = count });
        }
        
    }
}