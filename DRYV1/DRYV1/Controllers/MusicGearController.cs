using Microsoft.AspNetCore.Mvc;
using DRYV1.Data;
using DRYV1.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System;
using DRYV1.Services;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MusicGearController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MusicGearController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(
            string query,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var queryable = _context.MusicGear
                .Where(g => keywords.All(k => g.Brand.ToLower().Contains(k) ||
                                              g.Model.ToLower().Contains(k) ||
                                              g.Year.ToString().Contains(k) ||
                                              g.Description.ToLower().Contains(k) ||
                                              g.Location.ToLower().Contains(k)))
                .AsQueryable();

            var totalItems = await queryable.CountAsync();
            var results = await queryable
                .OrderByDescending(g => g.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (!results.Any())
            {
                return NotFound("No matching records found.");
            }

            var response = new
            {
                TotalItems = totalItems,
                Items = results
            };

            return Ok(response);
        }
        
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                return NotFound("User not found.");
            }

            var musicGear = await _context.MusicGear
                .Where(g => g.UserId == userId)
                .ToListAsync();

            if (!musicGear.Any())
            {
                return NotFound("No music gear found for this user.");
            }

            return Ok(musicGear);
        }
        
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] MusicGearUpdateDTO updatedMusicGear, [FromForm] List<IFormFile> imageFiles, [FromForm] List<string> imagesToDelete)
        {
            if (id != updatedMusicGear.Id)
            {
                return BadRequest("MusicGear ID mismatch.");
            }

            var musicGear = await _context.MusicGear.FindAsync(id);
            if (musicGear == null)
            {
                return NotFound("MusicGear not found.");
            }

            if (!string.IsNullOrEmpty(updatedMusicGear.Brand))
            {
                musicGear.Brand = updatedMusicGear.Brand;
            }

            if (!string.IsNullOrEmpty(updatedMusicGear.Model))
            {
                musicGear.Model = updatedMusicGear.Model;
            }

            if (updatedMusicGear.Year.HasValue)
            {
                musicGear.Year = updatedMusicGear.Year.Value;
            }

            if (!string.IsNullOrEmpty(updatedMusicGear.Description))
            {
                musicGear.Description = updatedMusicGear.Description;
            }

            if (!string.IsNullOrEmpty(updatedMusicGear.Location))
            {
                musicGear.Location = updatedMusicGear.Location;
            }

            if (!string.IsNullOrEmpty(updatedMusicGear.Condition))
            {
                musicGear.Condition = updatedMusicGear.Condition;
            }

            if (updatedMusicGear.Price.HasValue)
            {
                musicGear.Price = updatedMusicGear.Price.Value;
            }

            // Handle image deletion
            if (imagesToDelete != null && imagesToDelete.Any())
            {
                musicGear.ImagePaths = musicGear.ImagePaths.Except(imagesToDelete).ToList();
            }

            // Handle image addition
            if (imageFiles != null && imageFiles.Any())
            {
                var uploadPath = "assets/uploads/musicgear";
                var baseUrl = $"{Request.Scheme}://{Request.Host}/";
                var imageUrls = await ImageUploadHelper.UploadImagesAsync(imageFiles, uploadPath, baseUrl);
                musicGear.ImagePaths.AddRange(imageUrls);
            }

            _context.MusicGear.Update(musicGear);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var musicGear = await _context.MusicGear.FindAsync(id);
            if (musicGear == null)
            {
                return NotFound("MusicGear not found.");
            }

            // Find related comments and remove them
            var relatedComments = _context.Comments.Where(c => c.MusicGearId == id);
            _context.Comments.RemoveRange(relatedComments);

            // Ensure the paths are relative to wwwroot
            var relativeImagePaths = musicGear.ImagePaths.Select(p => p.Replace($"{Request.Scheme}://{Request.Host}/", "")).ToList();
            ImageUploadHelper.DeleteImages(relativeImagePaths);

            _context.MusicGear.Remove(musicGear);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Log the exception (ex) here if needed
                return StatusCode(500, "An error occurred while deleting the music gear.");
            }

            return NoContent();
        }
        
        [HttpDelete("{id}/images")]
        public async Task<IActionResult> DeleteImage(int id, [FromBody] string imageUrl)
        {
            var musicGear = await _context.MusicGear.FindAsync(id);
            if (musicGear == null)
            {
                return NotFound("MusicGear not found.");
            }

            if (musicGear.ImagePaths.Contains(imageUrl))
            {
                musicGear.ImagePaths.Remove(imageUrl);
                _context.MusicGear.Update(musicGear);
                await _context.SaveChangesAsync();
                return NoContent();
            }

            return NotFound("Image not found.");
        }
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var musicGear = await _context.MusicGear.FindAsync(id);
            if (musicGear == null)
            {
                return NotFound("MusicGear not found.");
            }

            return Ok(musicGear);
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
            var queryable = _context.MusicGear.AsQueryable();

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
                                                                   d.Location.ToLower().Contains(k)));
            }

            var totalItems = await queryable.CountAsync();
            var musicGear = await queryable
                .OrderByDescending(d => d.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new
            {
                TotalItems = totalItems,
                Items = musicGear
            };

            return Ok(response);
        }

    }
}