using DRYV1.Data;
using DRYV1.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email
                    
                })
                .ToListAsync();

            return Ok(users);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUserById(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserDTO updatedUser)
        {
            if (id != updatedUser.Id)
            {
                return BadRequest("User ID mismatch.");
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (!string.IsNullOrEmpty(updatedUser.Email) && updatedUser.Email.Trim() != "string")
            {
                var emailExists = await _context.Users
                    .AnyAsync(u => u.Email.ToLower().Trim() == updatedUser.Email.ToLower().Trim() && u.Id != id);
                if (emailExists)
                {
                    return BadRequest("Email is already in use.");
                }
            }

            if (!string.IsNullOrEmpty(updatedUser.Name) && updatedUser.Name.Trim() != "string")
            {
                var nameExists = await _context.Users
                    .AnyAsync(u => u.Name.ToLower().Trim() == updatedUser.Name.ToLower().Trim() && u.Id != id);
                if (nameExists)
                {
                    return BadRequest("Name is already in use.");
                }
            }

            // Update user properties after validation checks
            if (!string.IsNullOrEmpty(updatedUser.Email) && updatedUser.Email.Trim() != "string")
            {
                user.Email = updatedUser.Email.Trim();
            }

            if (!string.IsNullOrEmpty(updatedUser.Name) && updatedUser.Name.Trim() != "string")
            {
                user.Name = updatedUser.Name.Trim();
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
     
    }
}