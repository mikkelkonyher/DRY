// File: Controllers/AuthController.cs

using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using DRYV1.Data;
using DRYV1.Models;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwtService;
    private readonly EmailService _emailService;

    public AuthController(ApplicationDbContext context, JwtService jwtService, EmailService emailService)
    {
        _context = context;
        _jwtService = jwtService;
        _emailService = emailService;
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup(UserCreateDTO userCreateDTO)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == userCreateDTO.Email);

        if (existingUser != null && existingUser.IsValidated)
        {
            return BadRequest(new { Message = "A user with the same email already exists and is validated." });
        }

        var token = _jwtService.GenerateToken(new User { Email = userCreateDTO.Email });
        var verificationLink = Url.Action(nameof(VerifyEmail), "Auth", new { token, userCreateDTO.Name, userCreateDTO.Password }, Request.Scheme);

        await _emailService.SendEmailAsync(userCreateDTO.Email, "Verify your email", $"Please verify your email by clicking <a href='{verificationLink}'>here</a>.");

        return Ok(new { Message = "Please check your email to verify your account." });
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail(string token, string name, string password)
    {
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        var email = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;

        if (email == null)
        {
            return BadRequest(new { Message = "Invalid token." });
        }

        var existingUser = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);

        if (existingUser != null && existingUser.IsValidated)
        {
            return BadRequest(new { Message = "A user with the same email already exists and is validated." });
        }

        if (existingUser == null)
        {
            existingUser = new User
            {
                Name = name,
                Email = email,
                Password = BCrypt.Net.BCrypt.HashPassword(password),
                IsValidated = true
            };
            _context.Users.Add(existingUser);
        }
        else
        {
            existingUser.Name = name;
            existingUser.Password = BCrypt.Net.BCrypt.HashPassword(password);
            existingUser.IsValidated = true;
            _context.Users.Update(existingUser);
        }

        await _context.SaveChangesAsync();

        return Ok(new 
        {
            Message = "Email bekræftet og bruger oprettet/opdateret succesfuldt. Velkommen til Splash!",
           
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO loginDTO)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == loginDTO.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.Password))
        {
            return Unauthorized(new { Message = "Incorrect email or password." });
        }

        if (!user.IsValidated)
        {
            return Unauthorized(new { Message = "Email not verified. Please check your email to verify your account." });
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new { Token = token });
    }
}