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

        public MessagesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Messages/{userId}
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
                    Timestamp = m.Timestamp
                })
                .ToListAsync();

            return Ok(messages);
        }

        // POST: api/Messages
        [HttpPost]
        public async Task<ActionResult<MessageDTO>> SendMessage(MessageCreateDTO messageCreateDTO)
        {
            var message = new Message
            {
                SenderId = messageCreateDTO.SenderId,
                ReceiverId = messageCreateDTO.ReceiverId,
                Content = messageCreateDTO.Content,
                Timestamp = DateTime.UtcNow
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
                Timestamp = message.Timestamp
            };

            return CreatedAtAction(nameof(GetMessages), new { userId = message.SenderId }, messageDTO);
        }
        
        [HttpPost("markAsRead")]
        public async Task<IActionResult> MarkMessagesAsRead([FromBody] MarkMessagesAsReadDto dto)
        {
            var messages = await _context.Messages
                .Where(m => dto.MessageIds.Contains(m.Id))
                .ToListAsync();

            foreach (var message in messages)
            {
                message.Read = true;
            }

            await _context.SaveChangesAsync();

            return Ok("Messages marked as read");
        }
    }
}