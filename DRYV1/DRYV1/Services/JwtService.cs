using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DRYV1.Models;

// Service til at generere JWT-tokens til brugergodkendelse
public class JwtService
{
    private readonly IConfiguration _configuration;

    // Konstruktør modtager konfiguration (appsettings) via dependency injection
    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // Genererer et JWT-token for en bruger
    public string GenerateToken(User user)
    {
        // Henter JWT-indstillinger fra konfigurationen
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]));
        var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

        // Opretter claims til tokenet (f.eks. brugerens email og et unikt id)
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Opretter selve JWT-tokenet med udløbstid, issuer og audience
        var tokenOptions = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["ExpiryMinutes"])),
            signingCredentials: signinCredentials
        );

        // Returnerer det genererede token som en streng
        return new JwtSecurityTokenHandler().WriteToken(tokenOptions);
    }
}