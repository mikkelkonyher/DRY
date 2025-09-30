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
    public class HornsGearController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Controllerens konstruktør, modtager databasekontekst via dependency injection
        public HornsGearController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Henter alle blæser-annoncer med filtrering, søgning og pagination
        [HttpGet]
        public async Task<IActionResult> GetAll(
            int pageNumber = 1,
            int pageSize = 16,
            string hornsGearType = null,
            string location = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            string query = null)
        {
            var queryable = _context.HornsGear.AsQueryable();

            // Filtrerer på type
            if (!string.IsNullOrEmpty(hornsGearType))
            {
                var normalizedHornsGearType = hornsGearType.Trim().ToLower();
                queryable = queryable.Where(h => h.HornsGearType.ToLower() == normalizedHornsGearType);
            }

            // Filtrerer på lokation
            if (!string.IsNullOrEmpty(location))
            {
                var normalizedLocation = location.Trim().ToLower();
                queryable = queryable.Where(h => h.Location.ToLower().Contains(normalizedLocation));
            }

            // Filtrerer på minimumspris
            if (minPrice.HasValue)
            {
                queryable = queryable.Where(h => h.Price >= minPrice.Value);
            }

            // Filtrerer på maksimumspris
            if (maxPrice.HasValue)
            {
                queryable = queryable.Where(h => h.Price <= maxPrice.Value);
            }

            // Søger på nøgleord i flere felter
            if (!string.IsNullOrEmpty(query))
            {
                var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                queryable = queryable.Where(h => keywords.All(keyword => h.Brand.ToLower().Contains(keyword) ||
                                                                         h.Model.ToLower().Contains(keyword) ||
                                                                         h.Year.ToString().Contains(keyword) ||
                                                                         h.Description.ToLower().Contains(keyword) ||
                                                                         h.Location.ToLower().Contains(keyword) ||
                                                                         h.HornsGearType.ToLower().Contains(keyword)));
            }

            var totalItems = await queryable.CountAsync();
            var horns = await queryable
                .OrderByDescending(h => h.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new
            {
                TotalItems = totalItems,
                Items = horns
            };

            return Ok(response);
        }

        // Henter en enkelt blæser-annonce baseret på id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var horn = await _context.HornsGear.FindAsync(id);
            if (horn == null)
            {
                return NotFound();
            }

            var response = new
            {
                TotalItems = 1,
                Items = new List<HornsGear> { horn }
            };

            return Ok(response);
        }

        // Opretter en ny blæser-annonce, inkl. upload af billeder
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromForm] HornsGear hornsGear, [FromForm] List<IFormFile> imageFiles)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == hornsGear.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId");
            }

            hornsGear.ListingDate = DateTime.UtcNow;

            if (imageFiles != null && imageFiles.Count > 0)
            {
                try
                {
                    var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
                    hornsGear.ImagePaths = await ImageUploadHelper.UploadImagesAsync(imageFiles, "assets/uploads/musicgear", baseUrl);
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            _context.HornsGear.Add(hornsGear);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = hornsGear.Id }, hornsGear);
        }

        // Sletter en blæser-annonce baseret på id
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var horn = await _context.HornsGear.FindAsync(id);
            if (horn == null)
            {
                return NotFound();
            }

            _context.HornsGear.Remove(horn);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}