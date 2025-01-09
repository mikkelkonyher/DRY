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
    public class ChatsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChatsController(ApplicationDbContext context)
        {
            _context = context;
        }

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

        [HttpPost]
        public async Task<ActionResult<Chat>> CreateChat(Chat chat)
        {
            // Check if a chat with the same subject and sender already exists
            var existingChat = await _context.Chats
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Subject == chat.Subject && c.Messages.Any(m => m.SenderId == chat.Messages.First().SenderId));

            if (existingChat != null)
            {
                // Return the existing chat
                return Ok(existingChat);
            }

            // Create a new chat if it doesn't exist
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChats), new { id = chat.Id }, chat);
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<ChatDTO>>> GetChats(int userId)
        {
            var chats = await _context.Chats
                .Include(c => c.Messages)
                .Where(c => c.Messages.Any(m => m.SenderId == userId || m.ReceiverId == userId))
                .Select(c => new ChatDTO
                {
                    Id = c.Id,
                    Subject = c.Subject,
                    Messages = c.Messages
                        .OrderBy(m => m.Timestamp) // Order messages by Timestamp in ascending order
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

        // DELETE: api/Chats/{id}
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
                    // Mark as read for the receiver
                    message.IsReadReceiver = true;
                    _context.Entry(message).State = EntityState.Modified;
                }
                else if (message.SenderId == userId && !message.IsReadSender)
                {
                    // Optionally mark as read for the sender
                    message.IsReadSender = true;
                    _context.Entry(message).State = EntityState.Modified;
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
     
    }
}