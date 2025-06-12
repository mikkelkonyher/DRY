using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DRYV1.Data;
using DRYV1.Models;
using System.Linq;
using System.Threading.Tasks;

namespace DRYV1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;

        // Controllerens konstruktør, modtager databasekontekst og emailservice via dependency injection
        public MessagesController(ApplicationDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // Henter alle beskeder for en bruger (både sendte og modtagne)
        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<MessageDTO>>> GetMessages(int userId)
        {
            var messages = await _context.Messages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Select(m => new MessageDTO
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    SenderUsername = _context.Users.FirstOrDefault(u => u.Id == m.SenderId).Name,
                    ReceiverId = m.ReceiverId,
                    ReceiverUsername = _context.Users.FirstOrDefault(u => u.Id == m.ReceiverId).Name,
                    Content = m.Content,
                    Subject = m.Subject,
                    Timestamp = m.Timestamp,
                    IsReadSender = m.IsReadSender,
                    IsReadReceiver = m.IsReadReceiver,
                    ChatId = m.ChatId,
                })
                .ToListAsync();

            return Ok(messages);
        }

        // Sender en besked og opretter evt. en ny chat hvis nødvendigt
        [HttpPost]
        public async Task<ActionResult<MessageDTO>> SendMessage(MessageCreateDTO messageCreateDTO)
        {
            // Tjekker om en chat med samme emne og deltagere allerede findes
            var chat = await _context.Chats
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Subject == messageCreateDTO.Subject &&
                                          c.Messages.Any(m =>
                                              (m.SenderId == messageCreateDTO.SenderId && m.ReceiverId == messageCreateDTO.ReceiverId) ||
                                              (m.SenderId == messageCreateDTO.ReceiverId && m.ReceiverId == messageCreateDTO.SenderId)));

            if (chat == null)
            {
                // Opretter ny chat hvis den ikke findes
                chat = new Chat
                {
                    Subject = messageCreateDTO.Subject
                };
                _context.Chats.Add(chat);
                await _context.SaveChangesAsync();
            }

            // Opretter besked-objekt og tilføjer til databasen
            var message = new Message
            {
                SenderId = messageCreateDTO.SenderId,
                ReceiverId = messageCreateDTO.ReceiverId,
                Content = messageCreateDTO.Content,
                Subject = messageCreateDTO.Subject,
                Timestamp = DateTime.UtcNow,
                ChatId = chat.Id,
                Chat = chat
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            var messageDTO = new MessageDTO
            {
                Id = message.Id,
                SenderId = message.SenderId,
                SenderUsername = _context.Users.FirstOrDefault(u => u.Id == message.SenderId).Name,
                ReceiverId = message.ReceiverId,
                ReceiverUsername = _context.Users.FirstOrDefault(u => u.Id == message.ReceiverId).Name,
                Content = message.Content,
                Subject = message.Subject,
                Timestamp = message.Timestamp,
                ChatId = message.ChatId,
            };

            // Sender emailnotifikation til modtageren
            var inboxUrl = "https://www.gearninja.dk/inbox";
            var receiver = await _context.Users.FindAsync(messageCreateDTO.ReceiverId);
            if (receiver != null)
            {
                await _emailService.SendEmailAsync(receiver.Email, "Ny besked modtaget", $"Du har modtaget en ny besked fra {messageDTO.SenderUsername}. Klik <a href=\"{inboxUrl}\">her</a> for at gå til din inbox. 🥷");
            }

            return CreatedAtAction(nameof(GetMessages), new { userId = message.SenderId }, messageDTO);
        }

        // Sletter en besked baseret på id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
            {
                return NotFound();
            }

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}