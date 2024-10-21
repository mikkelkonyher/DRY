using Microsoft.AspNetCore.Mvc;
using DRYV1.Data;
using DRYV1.Models;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GuitarController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GuitarController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var guitars = await _context.Guitars.ToListAsync();
            return Ok(guitars);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var guitar = await _context.Guitars.FindAsync(id);
            if (guitar == null)
            {
                return NotFound();
            }
            return Ok(guitar);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Guitar guitar)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == guitar.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId");
            }

            _context.Guitars.Add(guitar);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = guitar.Id }, guitar);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Guitar guitar)
        {
            if (id != guitar.Id)
            {
                return BadRequest();
            }

            _context.Entry(guitar).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var guitar = await _context.Guitars.FindAsync(id);
            if (guitar == null)
            {
                return NotFound();
            }

            _context.Guitars.Remove(guitar);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}