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
        public async Task<IActionResult> Search(string query, string type = "")
        {
            var keywords = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var results = await _context.MusicGear
                .Where(g => (string.IsNullOrEmpty(type) ||
                             (g is GuitBassGear && ((GuitBassGear)g).GuitBassType.ToLower().Contains(type.ToLower())) ||
                             (g is DrumsGear && ((DrumsGear)g).DrumsGearType.ToLower().Contains(type.ToLower()))) &&
                            keywords.All(k => g.Brand.ToLower().Contains(k) ||
                                              g.Model.ToLower().Contains(k) ||
                                              g.Year.ToString().Contains(k) ||
                                              g.Description.ToLower().Contains(k) ||
                                              g.Location.ToLower().Contains(k) ||
                                              (g is GuitBassGear && ((GuitBassGear)g).GuitBassType.ToLower().Contains(k)) ||
                                              (g is DrumsGear && ((DrumsGear)g).DrumsGearType.ToLower().Contains(k))))
                .ToListAsync();

            if (!results.Any())
            {
                return NotFound("No matching records found.");
            }

            return Ok(results);
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
        
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] MusicGearUpdateDTO updatedMusicGear, [FromForm] List<IFormFile> imageFiles)
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

            if (!string.IsNullOrEmpty(updatedMusicGear.Brand) && updatedMusicGear.Brand != "string")
            {
                musicGear.Brand = updatedMusicGear.Brand;
            }

            if (!string.IsNullOrEmpty(updatedMusicGear.Model) && updatedMusicGear.Model != "string")
            {
                musicGear.Model = updatedMusicGear.Model;
            }

            if (updatedMusicGear.Year != 0)
            {
                musicGear.Year = updatedMusicGear.Year;
            }

            if (!string.IsNullOrEmpty(updatedMusicGear.Description) && updatedMusicGear.Description != "string")
            {
                musicGear.Description = updatedMusicGear.Description;
            }

            if (!string.IsNullOrEmpty(updatedMusicGear.Location) && updatedMusicGear.Location != "string")
            {
                musicGear.Location = updatedMusicGear.Location;
            }

            if (updatedMusicGear.Price != 0)
            {
                musicGear.Price = updatedMusicGear.Price;
            }

            if (imageFiles != null && imageFiles.Any())
            {
                var uploadPath = "uploads/musicgear";
                var baseUrl = $"{Request.Scheme}://{Request.Host}/";
                var imageUrls = await ImageUploadHelper.UploadImagesAsync(imageFiles, uploadPath, baseUrl);
                musicGear.ImagePaths = imageUrls;
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

            _context.MusicGear.Remove(musicGear);
            await _context.SaveChangesAsync();
            return NoContent();
        }

    }
}