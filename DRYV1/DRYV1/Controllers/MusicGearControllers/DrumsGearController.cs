using Microsoft.AspNetCore.Mvc;
using DRYV1.Data;
using DRYV1.Models;
using System.Threading.Tasks;
using System.Linq;
using DRYV1.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DrumsGearController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DrumsGearController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            int pageNumber = 1, 
            int pageSize = 10, 
            string drumsGearType = null, 
            string location = null, 
            decimal? minPrice = null, 
            decimal? maxPrice = null,
            string query = null)
        {
            var queryable = _context.DrumsGear.AsQueryable();

            if (!string.IsNullOrEmpty(drumsGearType))
            {
                var normalizedDrumsGearType = drumsGearType.Trim().ToLower();
                queryable = queryable.Where(d => d.DrumsGearType.ToLower() == normalizedDrumsGearType);
            }

            if (!string.IsNullOrEmpty(location))
            {
                var normalizedLocation = location.Trim().ToLower();
                queryable = queryable.Where(d => d.Location.ToLower().Contains(normalizedLocation));
            }

            if (minPrice.HasValue)
            {
                queryable = queryable.Where(d => d.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                queryable = queryable.Where(d => d.Price <= maxPrice.Value);
            }

            if (!string.IsNullOrEmpty(query))
            {
                var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                queryable = queryable.Where(d => keywords.All(k => d.Brand.ToLower().Contains(k) ||
                                                                   d.Model.ToLower().Contains(k) ||
                                                                   d.Year.ToString().Contains(k) ||
                                                                   d.Description.ToLower().Contains(k) ||
                                                                   d.Location.ToLower().Contains(k) ||
                                                                   d.DrumsGearType.ToLower().Contains(k)));
            }

            var totalItems = await queryable.CountAsync();
            var drums = await queryable
                .OrderByDescending(d => d.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new
            {
                TotalItems = totalItems,
                Items = drums
            };

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var drum = await _context.DrumsGear.FindAsync(id);
            if (drum == null)
            {
                return NotFound();
            }
            return Ok(drum);
        }

        [HttpPost]
     [Authorize]
        public async Task<IActionResult> Create([FromForm] DrumsGear drumGear, [FromForm] List<IFormFile> imageFiles)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == drumGear.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId");
            }

            drumGear.ListingDate = DateTime.UtcNow;

            if (imageFiles != null && imageFiles.Count > 0)
            {
                try
                {
                    var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
                    drumGear.ImagePaths = await ImageUploadHelper.UploadImagesAsync(imageFiles, "assets/uploads/musicgear", baseUrl);
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            _context.DrumsGear.Add(drumGear);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = drumGear.Id }, drumGear);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DrumsGear drumGear)
        {
            if (id != drumGear.Id)
            {
                return BadRequest();
            }

            _context.Entry(drumGear).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var drum = await _context.DrumsGear.FindAsync(id);
            if (drum == null)
            {
                return NotFound();
            }

            _context.DrumsGear.Remove(drum);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        
      
    }
}