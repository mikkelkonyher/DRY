namespace DRYV1.Models;

public class Chat
{
    public int Id { get; set; }
    public string Subject { get; set; }
    public List<Message> Messages { get; set; } = new List<Message>();
}

public class ChatDTO
{
    public int Id { get; set; }
    public string Subject { get; set; }
    public List<MessageDTO> Messages { get; set; }
}