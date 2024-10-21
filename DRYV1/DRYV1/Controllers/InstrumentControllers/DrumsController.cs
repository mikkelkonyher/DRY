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
    public class DrumsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DrumsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var drums = await _context.Drums.ToListAsync();
            return Ok(drums);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var drum = await _context.Drums.FindAsync(id);
            if (drum == null)
            {
                return NotFound();
            }
            return Ok(drum);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Drums drum)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == drum.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId");
            }

            _context.Drums.Add(drum);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = drum.Id }, drum);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Drums drum)
        {
            if (id != drum.Id)
            {
                return BadRequest();
            }

            _context.Entry(drum).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var drum = await _context.Drums.FindAsync(id);
            if (drum == null)
            {
                return NotFound();
            }

            _context.Drums.Remove(drum);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}