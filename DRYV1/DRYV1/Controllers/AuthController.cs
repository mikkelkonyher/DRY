using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using DRYV1.Data;
using DRYV1.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Security.Claims;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwtService;
    private readonly EmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly int _jwtExpirationMinutes = 30; // Token expiration time

    public AuthController(ApplicationDbContext context, JwtService jwtService, EmailService emailService, IConfiguration configuration)
    {
        _context = context;
        _jwtService = jwtService;
        _emailService = emailService;
        _configuration = configuration;
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

        return Redirect("http://localhost:5173/login");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO loginDTO)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == loginDTO.Email); // Get user by email

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.Password)) // Check if user exists and password is correct
        {
            return Unauthorized(new { Message = "Incorrect email or password." });
        }

        if (!user.IsValidated) 
        {
            return Unauthorized(new { Message = "Email not verified. Please check your email to verify your account." });
        }

        var token = GenerateJwtToken(user.Email); // Generate JWT token

        var cookieOptions = new CookieOptions 
        {
            HttpOnly = true, // Prevents JavaScript from accessing the cookie
            Secure = true, // Ensures that the cookie is sent only over HTTPS
            SameSite = SameSiteMode.Strict, // Prevents the browser from sending the cookie along with cross-site requests
            Expires = DateTime.UtcNow.AddMinutes(_jwtExpirationMinutes) 
        };

        Response.Cookies.Append("AuthToken", token, cookieOptions); // Add token to cookies

        return Ok(new { Message = "Login successful", Token = token });
    }

    private string GenerateJwtToken(string email) // Generate JWT token
    {
        var claims = new[] 
        {
            new Claim(JwtRegisteredClaimNames.Sub, email), 
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Unique identifier for the token
        };

        var jwtSettings = _configuration.GetSection("JwtSettings"); // Get JWT settings from appsettings.json
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"])); 
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256); // Create signing credentials

        var token = new JwtSecurityToken( 
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtExpirationMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] string email)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return BadRequest(new { Message = "User with this email does not exist." });
        }

        var token = _jwtService.GenerateToken(user);
        var resetLink = $"http://localhost:5173/reset-password/{token}";
        await _emailService.SendEmailAsync(email, "Reset your password", $"Please reset your password by clicking <a href='{resetLink}'>here</a>.");

        return Ok(new { Message = "Password reset link has been sent to your email." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO resetPasswordDTO)
    {
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(resetPasswordDTO.Token);
        var email = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;

        if (email == null)
        {
            return BadRequest(new { Message = "Invalid token." });
        }

        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return BadRequest(new { Message = "User with this email does not exist." });
        }

        user.Password = BCrypt.Net.BCrypt.HashPassword(resetPasswordDTO.NewPassword);
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Password has been reset successfully." });
    }
    
    [HttpGet("get-user-id")]
    public async Task<IActionResult> GetUserIdFromCookie()
    {
        if (Request.Cookies.TryGetValue("AuthToken", out var token)) // Get token from cookies
        {
            var handler = new JwtSecurityTokenHandler(); 
            var jwtToken = handler.ReadJwtToken(token); // Read token
            var email = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value; // Get email from token

            if (email == null)
            {
                return BadRequest(new { Message = "Invalid token." });
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email); // Get user by email
            if (user == null)
            {
                return BadRequest(new { Message = "User not found." });
            }

            return Ok(new { UserId = user.Id }); 
        }
        return BadRequest(new { Message = "Token not found in cookies." });
    }
}