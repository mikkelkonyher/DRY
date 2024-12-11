using Microsoft.AspNetCore.Mvc;
using DRYV1.Data;
using DRYV1.Models.MusicUtilities;
using DRYV1.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RehearsalRoomController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RehearsalRoomController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            int pageNumber = 1, 
            int pageSize = 10, 
            string location = null, 
            decimal? minPrice = null, 
            decimal? maxPrice = null,
            string query = null)
        {
            var queryable = _context.RehearsalRooms.AsQueryable();

            if (!string.IsNullOrEmpty(location))
            {
                var normalizedLocation = location.Trim().ToLower();
                queryable = queryable.Where(r => r.Location.ToLower().Contains(normalizedLocation));
            }

            if (minPrice.HasValue)
            {
                queryable = queryable.Where(r => r.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                queryable = queryable.Where(r => r.Price <= maxPrice.Value);
            }

            if (!string.IsNullOrEmpty(query))
            {
                var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                queryable = queryable.Where(r => keywords.All(k => r.Name.ToLower().Contains(k) ||
                                                                   r.Address.ToLower().Contains(k) ||
                                                                   r.Description.ToLower().Contains(k) ||
                                                                   r.Location.ToLower().Contains(k) ||
                                                                   r.Type.ToLower().Contains(k) ||
                                                                   r.RoomSize.ToString().Contains(k)));
            }

            var totalItems = await queryable.CountAsync();
            var rehearsalRooms = await queryable
                .OrderByDescending(r => r.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new
            {
                TotalItems = totalItems,
                Items = rehearsalRooms
            };

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var rehearsalRoom = await _context.RehearsalRooms.FindAsync(id);
            if (rehearsalRoom == null)
            {
                return NotFound();
            }

            var response = new
            {
                TotalItems = 1,
                Items = new List<RehearsalRoom> { rehearsalRoom }
            };

            return Ok(response);
        }

        [HttpPost]
      
        public async Task<IActionResult> Create([FromForm] RehearsalRoom rehearsalRoom, [FromForm] List<IFormFile> imageFiles)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == rehearsalRoom.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId");
            }

            rehearsalRoom.ListingDate = DateTime.UtcNow;

            if (imageFiles != null && imageFiles.Count > 0)
            {
                try
                {
                    var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
                    rehearsalRoom.ImagePaths = await ImageUploadHelper.UploadImagesAsync(imageFiles, "assets/uploads/rehearsalrooms", baseUrl);
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            _context.RehearsalRooms.Add(rehearsalRoom);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = rehearsalRoom.Id }, rehearsalRoom);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var rehearsalRoom = await _context.RehearsalRooms.FindAsync(id);
            if (rehearsalRoom == null)
            {
                return NotFound("RehearsalRoom not found.");
            }

            // Delete related comments
            var comments = _context.Comments.Where(c => c.RehearsalRoomId == id);
            _context.Comments.RemoveRange(comments);

            // Ensure the paths are relative to wwwroot
            var relativeImagePaths = rehearsalRoom.ImagePaths.Select(p => p.Replace($"{Request.Scheme}://{Request.Host}/", "")).ToList();
            ImageUploadHelper.DeleteImages(relativeImagePaths);

            _context.RehearsalRooms.Remove(rehearsalRoom);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        [HttpPut("update/{id}")]
public async Task<IActionResult> Update(int id, [FromForm] RehearsalRoomUpdateDTO updatedRehearsalRoom, [FromForm] List<IFormFile> imageFiles, [FromForm] List<string> imagesToDelete)
{
    if (id != updatedRehearsalRoom.Id)
    {
        return BadRequest("RehearsalRoom ID mismatch.");
    }

    var rehearsalRoom = await _context.RehearsalRooms.FindAsync(id);
    if (rehearsalRoom == null)
    {
        return NotFound("RehearsalRoom not found.");
    }

    if (!string.IsNullOrEmpty(updatedRehearsalRoom.Name))
    {
        rehearsalRoom.Name = updatedRehearsalRoom.Name;
    }

    if (!string.IsNullOrEmpty(updatedRehearsalRoom.Address))
    {
        rehearsalRoom.Address = updatedRehearsalRoom.Address;
    }

    if (!string.IsNullOrEmpty(updatedRehearsalRoom.Location))
    {
        rehearsalRoom.Location = updatedRehearsalRoom.Location;
    }

    if (!string.IsNullOrEmpty(updatedRehearsalRoom.Description))
    {
        rehearsalRoom.Description = updatedRehearsalRoom.Description;
    }

    if (!string.IsNullOrEmpty(updatedRehearsalRoom.PaymentType))
    {
        rehearsalRoom.PaymentType = updatedRehearsalRoom.PaymentType;
    }

    if (updatedRehearsalRoom.Price.HasValue)
    {
        rehearsalRoom.Price = updatedRehearsalRoom.Price.Value;
    }

    if (updatedRehearsalRoom.RoomSize.HasValue)
    {
        rehearsalRoom.RoomSize = updatedRehearsalRoom.RoomSize.Value;
    }

    if (!string.IsNullOrEmpty(updatedRehearsalRoom.Type))
    {
        rehearsalRoom.Type = updatedRehearsalRoom.Type;
    }

    // Handle image deletion
    if (imagesToDelete != null && imagesToDelete.Any())
    {
        rehearsalRoom.ImagePaths = rehearsalRoom.ImagePaths.Except(imagesToDelete).ToList();
    }

    // Handle image addition
    if (imageFiles != null && imageFiles.Any())
    {
        var uploadPath = "assets/uploads/rehearsalrooms";
        var baseUrl = $"{Request.Scheme}://{Request.Host}/";
        var imageUrls = await ImageUploadHelper.UploadImagesAsync(imageFiles, uploadPath, baseUrl);
        rehearsalRoom.ImagePaths.AddRange(imageUrls);
    }

    _context.RehearsalRooms.Update(rehearsalRoom);
    await _context.SaveChangesAsync();

    return NoContent();
}
    }
}