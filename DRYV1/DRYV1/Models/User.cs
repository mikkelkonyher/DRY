using DRYV1.Controllers;
using DRYV1.Models.MusicUtilities;

namespace DRYV1.Models
{
        public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public string Email { get; set; } 
        public string Password { get; set; }
        
        public bool IsValidated { get; set; } = false;
        
        public string? ProfileImageUrl { get; set; }
        
        public List<MusicGear> MusicGear { get; set; } = new List<MusicGear>();
        
        public List<RehearsalRoom> RehearsalRooms { get; set; } = new List<RehearsalRoom>();
    }

    public class UserDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        
        public string ProfileImageUrl { get; set; }
        
        
    }

    public class UserCreateDTO
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
    
    public class LoginDTO
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
    
    public class ResetPasswordDTO
    {
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }

}