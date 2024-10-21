using DRYV1.Controllers;

namespace DRYV1.Models
{
        public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; } 
        public string Password { get; set; }
        
        public List<Guitar> Guitars { get; set; } = new List<Guitar>();
        public List<Drums> Drums { get; set; } = new List<Drums>();
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