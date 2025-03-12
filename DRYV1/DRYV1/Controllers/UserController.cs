using DRYV1.Data;
using DRYV1.Models;
using DRYV1.Services;
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
                    Email = u.Email,
                    ProfileImageUrl = u.ProfileImageUrl
                })
                .ToListAsync();

            return Ok(users.Select(u => new
            {
                u.Id,
                u.Name,
                MaskedEmail = u.MaskedEmail,
                u.ProfileImageUrl
            }));
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
                    Email = u.Email,
                    ProfileImageUrl = u.ProfileImageUrl
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                user.Id,
                user.Name,
                MaskedEmail = user.MaskedEmail,
                user.ProfileImageUrl
            });
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

        [HttpPut("{id}/profile-image")]
        public async Task<IActionResult> UpdateProfileImage(int id, [FromForm] List<IFormFile> imageFiles)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (imageFiles != null && imageFiles.Any())
            {
                // Delete the existing profile image if it exists
                if (!string.IsNullOrEmpty(user.ProfileImageUrl))
                {
                    var existingImagePath = user.ProfileImageUrl.Replace($"{Request.Scheme}://{Request.Host}/", "");
                    ImageUploadHelper.DeleteImage(existingImagePath);
                }

                var uploadPath = "uploads/profile_images";
                var baseUrl = $"{Request.Scheme}://{Request.Host}/";
                var imageUrls = await ImageUploadHelper.UploadImagesAsync(imageFiles, uploadPath, baseUrl);
                user.ProfileImageUrl = imageUrls.FirstOrDefault();
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Find and delete all comments made on forums created by the user
            var userForums = await _context.Forums.Where(f => f.UserId == id).ToListAsync();
            foreach (var forum in userForums)
            {
                var forumComments = await _context.Comments.Where(c => c.ForumId == forum.Id).ToListAsync();
                _context.Comments.RemoveRange(forumComments);
            }

            // Find and delete all forums created by the user
            _context.Forums.RemoveRange(userForums);

            // Find and delete all liked forums by the user
            var likedForums = await _context.ForumLikes.Where(fl => fl.UserId == id).ToListAsync();
            _context.ForumLikes.RemoveRange(likedForums);

            // Find and delete all comments made by the user
            var userComments = await _context.Comments.Where(c => c.UserId == id).ToListAsync();
            _context.Comments.RemoveRange(userComments);

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        [HttpGet("unmasked")]
        public async Task<ActionResult<IEnumerable<UserProfileDTO>>> GetUsersUnmasked()
        {
            var users = await _context.Users
                .Select(u => new UserProfileDTO
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    ProfileImageUrl = u.ProfileImageUrl
                })
                .ToListAsync();

            return Ok(users);
        }
    }
}