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
    public class StringsGearController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StringsGearController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            int pageNumber = 1,
            int pageSize = 10,
            string stringsGearType = null,
            string location = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            string query = null)
        {
            var queryable = _context.StringsGear.AsQueryable();

            if (!string.IsNullOrEmpty(stringsGearType))
            {
                var normalizedStringsGearType = stringsGearType.Trim().ToLower();
                queryable = queryable.Where(s => s.StringsGearType.ToLower() == normalizedStringsGearType);
            }

            if (!string.IsNullOrEmpty(location))
            {
                var normalizedLocation = location.Trim().ToLower();
                queryable = queryable.Where(s => s.Location.ToLower().Contains(normalizedLocation));
            }

            if (minPrice.HasValue)
            {
                queryable = queryable.Where(s => s.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                queryable = queryable.Where(s => s.Price <= maxPrice.Value);
            }

            if (!string.IsNullOrEmpty(query))
            {
                var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                queryable = queryable.Where(s => keywords.All(keyword => s.Brand.ToLower().Contains(keyword) ||
                                                                         s.Model.ToLower().Contains(keyword) ||
                                                                         s.Year.ToString().Contains(keyword) ||
                                                                         s.Description.ToLower().Contains(keyword) ||
                                                                         s.Location.ToLower().Contains(keyword) ||
                                                                         s.StringsGearType.ToLower().Contains(keyword)));
            }

            var totalItems = await queryable.CountAsync();
            var strings = await queryable
                .OrderByDescending(s => s.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new
            {
                TotalItems = totalItems,
                Items = strings
            };

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var stringGear = await _context.StringsGear.FindAsync(id);
            if (stringGear == null)
            {
                return NotFound();
            }

            var response = new
            {
                TotalItems = 1,
                Items = new List<StringsGear> { stringGear }
            };

            return Ok(response);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromForm] StringsGear stringsGear, [FromForm] List<IFormFile> imageFiles)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == stringsGear.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId");
            }

            stringsGear.ListingDate = DateTime.UtcNow;

            if (imageFiles != null && imageFiles.Count > 0)
            {
                try
                {
                    var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
                    stringsGear.ImagePaths = await ImageUploadHelper.UploadImagesAsync(imageFiles, "assets/uploads/musicgear", baseUrl);
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            _context.StringsGear.Add(stringsGear);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = stringsGear.Id }, stringsGear);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var stringGear = await _context.StringsGear.FindAsync(id);
            if (stringGear == null)
            {
                return NotFound();
            }

            _context.StringsGear.Remove(stringGear);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}