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
    public class GuitarsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GuitarsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Guitars
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Guitar>>> GetGuitars()
        {
            return await _context.Guitars.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Guitar>> PostGuitar(Guitar guitar)
        {
            // Check if the UserId exists in the database
            var userExists = await _context.Users.AnyAsync(u => u.Id == guitar.UserId);
            if (!userExists)
            {
                return BadRequest(new { message = "Invalid UserId. User does not exist." });
            }

            _context.Guitars.Add(guitar);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGuitars), new { id = guitar.Id }, guitar);
        }
    }
}