using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Threading.Tasks;
using System.IO;

// Service til at sende e-mails
public class EmailService
{
    private readonly IConfiguration _configuration;

    // Konstruktor modtager konfiguration (f.eks. fra appsettings.json)
    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // Asynkron metode til at sende en e-mail
    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        // Hent e-mail indstillinger fra konfigurationen
        var emailSettings = _configuration.GetSection("EmailSettings");

        // Opret og konfigurer SMTP-klient
        using var smtpClient = new SmtpClient(emailSettings["SmtpServer"])
        {
            Port = int.Parse(emailSettings["SmtpPort"]),
            Credentials = new NetworkCredential(emailSettings["SenderEmail"], emailSettings["SenderPassword"]),
            EnableSsl = true,
        };

        // Opret e-mail besked og sæt afsender, modtager, emne og HTML-format
        using var mailMessage = new MailMessage
        {
            From = new MailAddress(emailSettings["SenderEmail"], emailSettings["SenderName"]),
            Subject = subject,
            IsBodyHtml = true,
        };
        mailMessage.To.Add(toEmail);

        // Sti til logo-billedet, der skal indsættes i e-mailen
        var logoPath = "/Users/mikkelkonyher/Documents/GitHub/DRY/DRYV1/DRYV1/wwwroot/assets/MailImage/logo.png";
        if (!File.Exists(logoPath))
            throw new FileNotFoundException("Logo image not found.", logoPath);

        // HTML-signatur med links og hilsen
        string signature = @"
            <br><br><br><br>
            Med skarpeste ninjahilsen,<br>
            Gearninja<br> <br>
            <a href='https://gearninja.dk'>Gearninja.dk</a> |
            <a href='mailto:gearninja@gearninja.dk'>Email</a> |
            <a href='https://www.facebook.com/profile.php?id=61575987808404'>Facebook</a> |
            <a href='https://www.instagram.com/gearninja.dk/'>Instagram</a>
        ";

        // Saml hele HTML-indholdet til e-mailen, inkl. logo, brødtekst og signatur
        string htmlBody = $@"
    <div style='margin-left:20px;'>
        <img src='cid:logoImage' alt='Logo' style='width:200px;'>
    </div> <br><br>
    {body}
    {signature}
";

        // Opret AlternateView for at kunne indsætte billeder i e-mailen
        var htmlView = AlternateView.CreateAlternateViewFromString(htmlBody, null, MediaTypeNames.Text.Html);

        // Tilføj logo-billedet som en LinkedResource, så det kan vises i e-mailen
        var logoResource = new LinkedResource(logoPath, MediaTypeNames.Image.Png)
        {
            ContentId = "logoImage",
            TransferEncoding = TransferEncoding.Base64
        };
        htmlView.LinkedResources.Add(logoResource);

        // Tilføj HTML-viewet til e-mailen
        mailMessage.AlternateViews.Add(htmlView);

        // Send e-mailen asynkront
        await smtpClient.SendMailAsync(mailMessage);
    }
}