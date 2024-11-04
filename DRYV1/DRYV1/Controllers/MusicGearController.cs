using Microsoft.AspNetCore.Mvc;
using DRYV1.Data;
using DRYV1.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System;

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
    }
}