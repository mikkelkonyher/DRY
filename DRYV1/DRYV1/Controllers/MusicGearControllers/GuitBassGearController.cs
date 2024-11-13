using Microsoft.AspNetCore.Mvc;
using DRYV1.Data;
using DRYV1.Models;
using DRYV1.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using System;

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
        public async Task<IActionResult> GetAll()
        {
            var guitars = await _context.GuitBassGear.ToListAsync();
            return Ok(guitars);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var guitar = await _context.GuitBassGear.FindAsync(id);
            if (guitar == null)
            {
                return NotFound();
            }
            return Ok(guitar);
        }
        
        
        [HttpPost]
        [Authorize]
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
        
        [HttpGet("search")]
        public async Task<IActionResult> Search(string query)
        {
            var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var results = await _context.GuitBassGear
                .Where(g => keywords.All(k => g.Brand.ToLower().Contains(k) ||
                                              g.Model.ToLower().Contains(k) ||
                                              g.Year.ToString().Contains(k) ||
                                              g.Description.ToLower().Contains(k) ||
                                              g.Location.ToLower().Contains(k) ||
                                              g.GuitBassType.ToLower().Contains(k)))
                .ToListAsync();

            if (!results.Any())
            {
                return NotFound("No matching records found.");
            }

            return Ok(results);
        }
        
        [HttpGet("filter")]
        public async Task<IActionResult> Filter(
            string model = null,
            string brand = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            string guitBassType = null,
            int? year = null,
            string location = null)
        {
            var query = _context.GuitBassGear.AsQueryable();

            if (!string.IsNullOrEmpty(model))
            {
                query = query.Where(g => g.Model.ToLower().Contains(model.ToLower()));
            }

            if (!string.IsNullOrEmpty(brand))
            {
                query = query.Where(g => g.Brand.ToLower().Contains(brand.ToLower()));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(g => g.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(g => g.Price <= maxPrice.Value);
            }

            if (!string.IsNullOrEmpty(guitBassType))
            {
                query = query.Where(g => g.GuitBassType.ToLower().Contains(guitBassType.ToLower()));
            }

            if (year.HasValue)
            {
                query = query.Where(g => g.Year == year.Value);
            }

            if (!string.IsNullOrEmpty(location))
            {
                query = query.Where(g => g.Location.ToLower().Contains(location.ToLower()));
            }

            var results = await query.ToListAsync();

            if (!results.Any())
            {
                return NotFound("No matching records found.");
            }

            return Ok(results);
        }
    }
}