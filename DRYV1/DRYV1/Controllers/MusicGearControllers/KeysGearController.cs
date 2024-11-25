using Microsoft.AspNetCore.Mvc;
using DRYV1.Data;
using DRYV1.Models;
using DRYV1.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KeysGearController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public KeysGearController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            int pageNumber = 1,
            int pageSize = 10,
            string keysGearType = null,
            string location = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            string query = null)
        {
            var queryable = _context.KeysGear.AsQueryable();

            if (!string.IsNullOrEmpty(keysGearType))
            {
                var normalizedKeysGearType = keysGearType.Trim().ToLower();
                queryable = queryable.Where(k => k.KeysGearType.ToLower() == normalizedKeysGearType);
            }

            if (!string.IsNullOrEmpty(location))
            {
                var normalizedLocation = location.Trim().ToLower();
                queryable = queryable.Where(k => k.Location.ToLower().Contains(normalizedLocation));
            }

            if (minPrice.HasValue)
            {
                queryable = queryable.Where(k => k.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                queryable = queryable.Where(k => k.Price <= maxPrice.Value);
            }

            if (!string.IsNullOrEmpty(query))
            {
                var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                queryable = queryable.Where(k => keywords.All(keyword => k.Brand.ToLower().Contains(keyword) ||
                                                                         k.Model.ToLower().Contains(keyword) ||
                                                                         k.Year.ToString().Contains(keyword) ||
                                                                         k.Description.ToLower().Contains(keyword) ||
                                                                         k.Location.ToLower().Contains(keyword) ||
                                                                         k.KeysGearType.ToLower().Contains(keyword)));
            }

            var totalItems = await queryable.CountAsync();
            var keys = await queryable
                .OrderByDescending(k => k.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new
            {
                TotalItems = totalItems,
                Items = keys
            };

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var key = await _context.KeysGear.FindAsync(id);
            if (key == null)
            {
                return NotFound();
            }

            var response = new
            {
                TotalItems = 1,
                Items = new List<KeysGear> { key }
            };

            return Ok(response);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromForm] KeysGear keysGear, [FromForm] List<IFormFile> imageFiles)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == keysGear.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId");
            }

            keysGear.ListingDate = DateTime.UtcNow;

            if (imageFiles != null && imageFiles.Count > 0)
            {
                try
                {
                    var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
                    keysGear.ImagePaths = await ImageUploadHelper.UploadImagesAsync(imageFiles, "assets/uploads/musicgear", baseUrl);
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            _context.KeysGear.Add(keysGear);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = keysGear.Id }, keysGear);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var key = await _context.KeysGear.FindAsync(id);
            if (key == null)
            {
                return NotFound();
            }

            _context.KeysGear.Remove(key);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}