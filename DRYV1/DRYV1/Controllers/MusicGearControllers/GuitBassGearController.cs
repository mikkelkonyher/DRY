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
    public class GuitBassGearController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GuitBassGearController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll(
            int pageNumber = 1, 
            int pageSize = 10, 
            string guitBassType = null, 
            string location = null, 
            decimal? minPrice = null, 
            decimal? maxPrice = null,
            string query = null)
        {
            var queryable = _context.GuitBassGear.AsQueryable(); 

            if (!string.IsNullOrEmpty(guitBassType)) 
            {
                var normalizedGuitBassType = guitBassType.Trim().ToLower();
                queryable = queryable.Where(g => g.GuitBassType.ToLower() == normalizedGuitBassType); 
            }

            if (!string.IsNullOrEmpty(location))
            {
                var normalizedLocation = location.Trim().ToLower();
                queryable = queryable.Where(g => g.Location.ToLower().Contains(normalizedLocation));
            }

            if (minPrice.HasValue)
            {
                queryable = queryable.Where(g => g.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                queryable = queryable.Where(g => g.Price <= maxPrice.Value);
            }

            if (!string.IsNullOrEmpty(query))
            {
                var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                queryable = queryable.Where(g => keywords.All(k => g.Brand.ToLower().Contains(k) ||
                                                                   g.Model.ToLower().Contains(k) ||
                                                                   g.Year.ToString().Contains(k) ||
                                                                   g.Description.ToLower().Contains(k) ||
                                                                   g.Location.ToLower().Contains(k) ||
                                                                   g.GuitBassType.ToLower().Contains(k)));
            }

            var totalItems = await queryable.CountAsync();
            var guitars = await queryable
                .OrderByDescending(g => g.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new
            {
                TotalItems = totalItems,
                Items = guitars
            };

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var guitar = await _context.GuitBassGear.FindAsync(id);
            if (guitar == null)
            {
                return NotFound();
            }

            var response = new
            {
                TotalItems = 1,
                Items = new List<GuitBassGear> { guitar }
            };

            return Ok(response);
        }
        
        
        [HttpPost]
        
        public async Task<IActionResult> Create([FromForm] GuitBassGear guitBassGear, [FromForm] List<IFormFile> imageFiles)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == guitBassGear.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId");
            }

            guitBassGear.ListingDate = DateTime.UtcNow;

            if (imageFiles != null && imageFiles.Count > 0)
            {
                try
                {
                    var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
                    guitBassGear.ImagePaths = await ImageUploadHelper.UploadImagesAsync(imageFiles, "assets/uploads/musicgear", baseUrl);
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            _context.GuitBassGear.Add(guitBassGear);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = guitBassGear.Id }, guitBassGear);
        }

        

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var guitar = await _context.GuitBassGear.FindAsync(id);
            if (guitar == null)
            {
                return NotFound();
            }

            _context.GuitBassGear.Remove(guitar);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        
      
        
    }
}