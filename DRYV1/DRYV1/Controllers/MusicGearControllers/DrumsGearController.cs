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
        public async Task<IActionResult> GetAll()
        {
            var drums = await _context.DrumsGear.ToListAsync();
            return Ok(drums);
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
                    drumGear.ImagePaths = await ImageUploadHelper.UploadImagesAsync(imageFiles, "assets", baseUrl);
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
        
        [HttpGet("search")]
        public async Task<IActionResult> Search(string query)
        {
            var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var results = await _context.DrumsGear
                .Where(g => keywords.All(k => g.Brand.ToLower().Contains(k) ||
                                              g.Model.ToLower().Contains(k) ||
                                              g.Year.ToString().Contains(k) ||
                                              g.Description.ToLower().Contains(k) ||
                                              g.Location.ToLower().Contains(k) ||
                                              g.DrumsGearType.ToLower().Contains(k)))
                .ToListAsync();

            if (!results.Any())
            {
                return NotFound("No matching records found.");
            }

            return Ok(results);
        }
    }
}