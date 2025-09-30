using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DRYV1.Data;
using DRYV1.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace DRYV1.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class ChatsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Controllerens konstruktør, modtager databasekontekst via dependency injection
        public ChatsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Henter alle chats med tilhørende beskeder
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChatDTO>>> GetChats()
        {
            var chats = await _context.Chats
                .Include(c => c.Messages)
                .Select(c => new ChatDTO
                {
                    Id = c.Id,
                    Subject = c.Subject,
                    Messages = c.Messages.Select(m => new MessageDTO
                    {
                        Id = m.Id,
                        SenderId = m.SenderId,
                        SenderUsername = _context.Users.FirstOrDefault(u => u.Id == m.SenderId).Name,
                        ReceiverId = m.ReceiverId,
                        ReceiverUsername = _context.Users.FirstOrDefault(u => u.Id == m.ReceiverId).Name,
                        Content = m.Content,
                        Subject = m.Subject,
                        Timestamp = m.Timestamp,
                        ChatId = m.ChatId
                    }).ToList()
                })
                .ToListAsync();

            return Ok(chats);
        }

        // Opretter en ny chat, hvis den ikke allerede findes
        [HttpPost]
        public async Task<ActionResult<Chat>> CreateChat(Chat chat)
        {
            // Tjekker om en chat med samme emne og afsender allerede findes
            var existingChat = await _context.Chats
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Subject == chat.Subject && c.Messages.Any(m => m.SenderId == chat.Messages.First().SenderId));

            if (existingChat != null)
            {
                // Returnerer eksisterende chat hvis fundet
                return Ok(existingChat);
            }

            // Opretter ny chat hvis den ikke findes
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChats), new { id = chat.Id }, chat);
        }

        // Henter alle chats for en bestemt bruger, sorteret efter seneste besked
        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<ChatDTO>>> GetChats(int userId)
        {
            var chats = await _context.Chats
                .Include(c => c.Messages)
                .Where(c =>
                    c.Messages.Any(m => m.SenderId == userId || m.ReceiverId == userId) &&
                    (
                        (c.Messages.Any(m => m.SenderId == userId) && !c.IsDeletedBySender) ||
                        (c.Messages.Any(m => m.ReceiverId == userId) && !c.IsDeletedByReceiver)
                    )
                )
                .OrderByDescending(c => c.Messages.Max(m => m.Timestamp)) // Sorterer chats efter seneste besked
                .Select(c => new ChatDTO
                {
                    Id = c.Id,
                    Subject = c.Subject,
                    Messages = c.Messages
                        .OrderByDescending(m => m.Timestamp) // Sorterer beskeder nyeste først
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
                            ChatId = m.ChatId
                        }).ToList()
                })
                .ToListAsync();

            return Ok(chats);
        }
        
        // Soft-delete af chat for en bestemt bruger (skjuler chatten for brugeren)
        [HttpPut("{chatId}/softDelete/{userId}")]
        public async Task<IActionResult> SoftDeleteChat(int chatId, int userId)
        {
            var chat = await _context.Chats
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == chatId);
            if (chat == null)
            {
                return NotFound();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            if (chat.Messages.Any(m => m.SenderId == userId))
            {
                chat.IsDeletedBySender = true;
            }
            else if (chat.Messages.Any(m => m.ReceiverId == userId))
            {
                chat.IsDeletedByReceiver = true;
            }
            else
            {
                return BadRequest("User is not part of this chat.");
            }

            _context.Entry(chat).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Sletter en chat permanent
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChat(int id)
        {
            var chat = await _context.Chats.FindAsync(id);
            if (chat == null)
            {
                return NotFound();
            }

            _context.Chats.Remove(chat);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        // Markerer alle beskeder i en chat som læst for en bestemt bruger
        [HttpPut("{chatId}/markAllAsRead/{userId}")]
        public async Task<IActionResult> MarkAllMessagesAsRead(int chatId, int userId)
        {
            var chat = await _context.Chats
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == chatId);

            if (chat == null)
            {
                return NotFound();
            }

            foreach (var message in chat.Messages)
            {
                if (message.ReceiverId == userId && !message.IsReadReceiver)
                {
                    // Marker som læst for modtager
                    message.IsReadReceiver = true;
                    _context.Entry(message).State = EntityState.Modified;
                }
                else if (message.SenderId == userId && !message.IsReadSender)
                {
                    // Marker evt. som læst for afsender
                    message.IsReadSender = true;
                    _context.Entry(message).State = EntityState.Modified;
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
     
    }
}