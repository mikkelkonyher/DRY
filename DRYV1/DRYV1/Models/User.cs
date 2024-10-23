using DRYV1.Controllers;

namespace DRYV1.Models
{
        public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public string Email { get; set; } 
        public string Password { get; set; }
        
        public List<MusicGear> Instruments { get; set; } = new List<MusicGear>();
    }

    public class UserDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
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

}