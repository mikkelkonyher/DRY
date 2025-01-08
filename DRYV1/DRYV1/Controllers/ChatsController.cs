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

        // POST: api/Chats
        [HttpPost]
        public async Task<ActionResult<Chat>> CreateChat(Chat chat)
        {
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChats), new { id = chat.Id }, chat);
        }

        // GET: api/Chats/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Chat>> GetChat(int id)
        {
            var chat = await _context.Chats.FindAsync(id);

            if (chat == null)
            {
                return NotFound();
            }

            return chat;
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
    }
}