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
    public class StudioGearController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Controllerens konstruktør, modtager databasekontekst via dependency injection
        public StudioGearController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Henter alle studie-annoncer med filtrering, søgning og pagination
        [HttpGet]
        public async Task<IActionResult> GetAll(
            int pageNumber = 1, 
            int pageSize = 16, 
            string studioGearType = null, 
            string location = null, 
            decimal? minPrice = null, 
            decimal? maxPrice = null,
            string query = null)
        {
            var queryable = _context.StudioGear.AsQueryable();

            // Filtrerer på type
            if (!string.IsNullOrEmpty(studioGearType))
            {
                var normalizedStudioGearType = studioGearType.Trim().ToLower();
                queryable = queryable.Where(s => s.StudioGearType.ToLower() == normalizedStudioGearType);
            }

            // Filtrerer på lokation
            if (!string.IsNullOrEmpty(location))
            {
                var normalizedLocation = location.Trim().ToLower();
                queryable = queryable.Where(s => s.Location.ToLower().Contains(normalizedLocation));
            }

            // Filtrerer på minimumspris
            if (minPrice.HasValue)
            {
                queryable = queryable.Where(s => s.Price >= minPrice.Value);
            }

            // Filtrerer på maksimumspris
            if (maxPrice.HasValue)
            {
                queryable = queryable.Where(s => s.Price <= maxPrice.Value);
            }

            // Søger på nøgleord i flere felter
            if (!string.IsNullOrEmpty(query))
            {
                var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                queryable = queryable.Where(s => keywords.All(k => s.Brand.ToLower().Contains(k) ||
                                                                   s.Model.ToLower().Contains(k) ||
                                                                   s.Year.ToString().Contains(k) ||
                                                                   s.Description.ToLower().Contains(k) ||
                                                                   s.Location.ToLower().Contains(k) ||
                                                                   s.StudioGearType.ToLower().Contains(k)));
            }

            var totalItems = await queryable.CountAsync();
            var studioGears = await queryable
                .OrderByDescending(s => s.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new
            {
                TotalItems = totalItems,
                Items = studioGears
            };

            return Ok(response);
        }

        // Henter en enkelt studie-annonce baseret på id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var studioGear = await _context.StudioGear.FindAsync(id);
            if (studioGear == null)
            {
                return NotFound();
            }

            var response = new
            {
                TotalItems = 1,
                Items = new List<StudioGear> { studioGear }
            };

            return Ok(response);
        }

        // Opretter en ny studie-annonce, inkl. upload af billeder
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] StudioGear studioGear, [FromForm] List<IFormFile> imageFiles)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == studioGear.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId");
            }

            studioGear.ListingDate = DateTime.UtcNow;

            if (imageFiles != null && imageFiles.Count > 0)
            {
                try
                {
                    var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
                    studioGear.ImagePaths = await ImageUploadHelper.UploadImagesAsync(imageFiles, "assets/uploads/musicgear", baseUrl);
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            _context.StudioGear.Add(studioGear);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = studioGear.Id }, studioGear);
        }

        // Sletter en studie-annonce baseret på id
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var studioGear = await _context.StudioGear.FindAsync(id);
            if (studioGear == null)
            {
                return NotFound();
            }

            _context.StudioGear.Remove(studioGear);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}