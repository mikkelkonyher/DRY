using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

// Service til at sende e-mails via SMTP
public class EmailService
{
    private readonly IConfiguration _configuration;

    // Konstruktør modtager konfiguration (appsettings) via dependency injection
    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // Sender en e-mail asynkront
    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        // Henter e-mail-indstillinger fra konfigurationen
        var emailSettings = _configuration.GetSection("EmailSettings");

        // Opretter SMTP-klient med de angivne indstillinger
        var smtpClient = new SmtpClient(emailSettings["SmtpServer"])
        {
            Port = int.Parse(emailSettings["SmtpPort"]),
            Credentials = new NetworkCredential(emailSettings["SenderEmail"], emailSettings["SenderPassword"]),
            EnableSsl = true,
        };

        // Opretter selve e-mailen
        var mailMessage = new MailMessage
        {
            From = new MailAddress(emailSettings["SenderEmail"], emailSettings["SenderName"]),
            Subject = subject,
            Body = body,
            IsBodyHtml = true,
        };

        // Tilføjer modtager
        mailMessage.To.Add(toEmail);

        // Sender e-mailen asynkront
        await smtpClient.SendMailAsync(mailMessage);
    }
}