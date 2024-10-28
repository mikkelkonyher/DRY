using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DRYV1.Data;
using DRYV1.Models;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwtService;

    public AuthController(ApplicationDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup(UserCreateDTO userCreateDTO)
    {
        var user = new User
        {
            Name = userCreateDTO.Name,
            Email = userCreateDTO.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(userCreateDTO.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Bruger oprettet med succes" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO loginDTO)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == loginDTO.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.Password))
        {
            return Unauthorized(new { Message = "Forkert email eller adgangskode" });
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new { Token = token });
    }
}