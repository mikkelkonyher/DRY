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

        public string MaskedEmail
        {
            get
            {
                if (string.IsNullOrEmpty(Email))
                    return string.Empty;

                var emailParts = Email.Split('@');
                if (emailParts.Length != 2)
                    return Email;

                var localPart = emailParts[0];
                var domainPart = emailParts[1];

                var maskedLocalPart = localPart.Length > 2
                    ? localPart.Substring(0, 2) + new string('*', localPart.Length - 2)
                    : new string('*', localPart.Length);

                return $"{maskedLocalPart}@{domainPart}";
            }
        }
    }
    
    public class UserProfileDTO
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