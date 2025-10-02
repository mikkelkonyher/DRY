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
using Microsoft.AspNetCore.Authorization;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwtService;
    private readonly EmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly int _jwtExpirationMinutes = 2880; // Token udløbstid i minutter

    // Controllerens konstruktør, modtager nødvendige services via dependency injection
    public AuthController(ApplicationDbContext context, JwtService jwtService, EmailService emailService, IConfiguration configuration)
    {
        _context = context;
        _jwtService = jwtService;
        _emailService = emailService;
        _configuration = configuration;
    }
    
    // Opretter en ny bruger og sender bekræftelsesmail
    [HttpPost("signup")]
    public async Task<IActionResult> Signup(UserCreateDTO userCreateDTO)
    {
        // Tjekker om email allerede er i brug
        var existingUserByEmail = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == userCreateDTO.Email);

        if (existingUserByEmail != null)
        {
            if (existingUserByEmail.IsValidated)
            {
                return BadRequest(new { Message = "A user with the same email already exists and is validated." });
            }
            else
            {
                return BadRequest(new { Message = "A user with the same email already exists but is not validated. Please check your email to verify your account." });
            }
        }

        // Tjekker om brugernavn allerede er i brug
        var existingUserByName = await _context.Users
            .FirstOrDefaultAsync(u => u.Name == userCreateDTO.Name);

        if (existingUserByName != null)
        {
            return BadRequest(new { Message = "A user with the same name already exists." });
        }

        // Opretter ny bruger
        var newUser = new User
        {
            Name = userCreateDTO.Name,
            Email = userCreateDTO.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(userCreateDTO.Password),
            IsValidated = false
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        // Genererer bekræftelseslink og sender email
        var token = _jwtService.GenerateToken(newUser);
        var verificationLink = Url.Action(nameof(VerifyEmail), "Auth", new { token, name = userCreateDTO.Name }, Request.Scheme);

        await _emailService.SendEmailAsync(userCreateDTO.Email, "Bekræft din e-mail",
            $"Venligst bekræft din e-mail ved at klikke <a href='{verificationLink}'>her</a>. Du bliver derefter ført videre til login-siden. 🥷");

        return Ok(new { Message = "Please check your email to verify your account." });
    }

    // Bekræfter brugerens email via token
    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail(string token)
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
            return BadRequest(new { Message = "User not found. Please sign up again." });
        }

        existingUser.IsValidated = true;
        _context.Users.Update(existingUser);
        await _context.SaveChangesAsync();

        return Redirect("https://www.gearninja.dk/login");
    }
    
    // Logger bruger ind og sætter JWT-token i cookie
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO loginDTO)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == loginDTO.Email); // Henter bruger via email

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.Password)) // Tjekker om bruger findes og password er korrekt
        {
            return Unauthorized(new { Message = "Incorrect email or password." });
        }

        if (!user.IsValidated) 
        {
            return Unauthorized(new { Message = "Email not verified. Please check your email to verify your account." });
        }

        var token = GenerateJwtToken(user.Email); // Genererer JWT-token

        var cookieOptions = new CookieOptions 
        {
            HttpOnly = true, // Forhindrer JavaScript i at tilgå cookien
            Secure = true, // Kun via HTTPS
            SameSite = SameSiteMode.None, // Tillader cross-site requests
            Domain = ".gearninja.dk", // ".gearninja.dk" i produktion
            Expires = DateTime.UtcNow.AddMinutes(_jwtExpirationMinutes),
        };

        Response.Cookies.Append("AuthToken", token, cookieOptions); // Tilføjer token til cookies

        return Ok(new { Message = "Login successful", Token = token });
    }

    // Genererer JWT-token ud fra email
    private string GenerateJwtToken(string email)
    {
        var claims = new[] 
        {
            new Claim(JwtRegisteredClaimNames.Sub, email), 
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Unik identifikator for token
        };

        var jwtSettings = _configuration.GetSection("JwtSettings"); // Henter JWT-indstillinger fra appsettings.json
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"])); 
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256); // Opretter signeringsnøgle

        var token = new JwtSecurityToken( 
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtExpirationMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // Sender email med link til nulstilling af adgangskode
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] string email)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return BadRequest(new { Message = "User with this email does not exist." });
        }

        var token = _jwtService.GenerateToken(user);
        var resetLink = $"https://www.gearninja.dk/reset-password/{token}"; // Når du tester lokalt, brug "http://localhost:5173/reset-password/{token}" ellers brug "https://www.gearninja.dk/reset-password/{token}"
        await _emailService.SendEmailAsync(email, "Reset din adgangskode",
            $"Venligst nulstil din adgangskode ved at klikke <a href='{resetLink}'>her</a>.🥷");

        return Ok(new { Message = "Password reset link has been sent to your email." });
    }

    // Nulstiller adgangskode via token
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
    
    // Henter brugerens ID ud fra AuthToken-cookie
    [HttpGet("get-user-id")]
    [Authorize]
    public async Task<IActionResult> GetUserIdFromCookie()
    {
        if (!Request.Cookies.TryGetValue("AuthToken", out var token))
        {
            return Unauthorized(new { Message = "AuthToken cookie not found." });
        }

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        var email = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return BadRequest(new { Message = "Invalid token." });
        }

        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return NotFound(new { Message = "User not found." });
        }

        return Ok(new { UserId = user.Id });
    }
    
    // Logger bruger ud og fjerner AuthToken-cookie
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        if (Request.Cookies.ContainsKey("AuthToken"))
        {
            var cookieOptions = new CookieOptions
            {
                Expires = DateTime.UtcNow.AddDays(-1), // Sætter udløbsdato i fortiden for at slette cookien
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Domain = ".gearninja.dk", // ".gearninja.dk" i produktion
                Path = "/"
            };

            Response.Cookies.Append("AuthToken", "", cookieOptions);
        }

        return Ok(new { Message = "Logout successful" });
    }
}