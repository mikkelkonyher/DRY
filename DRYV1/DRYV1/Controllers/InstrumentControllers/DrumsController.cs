using Microsoft.AspNetCore.Mvc;
using DRYV1.Models;
using DRYV1.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace DRYV1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DrumsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DrumsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Drums
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Drums>>> GetDrums()
        {
            return await _context.Drums.ToListAsync();
        }

        // POST: api/Drums
        [HttpPost]
        public async Task<ActionResult<Drums>> PostDrums(Drums drums)
        {
            // Check if the UserId exists in the database
            var userExists = await _context.Users.AnyAsync(u => u.Id == drums.UserId);
            if (!userExists)
            {
                return BadRequest(new { message = "Invalid UserId. User does not exist." });
            }

            _context.Drums.Add(drums);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDrums), new { id = drums.Id }, drums);
        }
    }
}