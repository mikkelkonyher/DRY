namespace DRYV1.Models;

public class Chat
{
    public int Id { get; set; }
    public string Subject { get; set; }
    public List<Message> Messages { get; set; } = new List<Message>();
    
    public bool IsDeletedBySender { get; set; } = false;
    public bool IsDeletedByReceiver { get; set; } = false;
}

public class ChatDTO
{
    public int Id { get; set; }
    public string Subject { get; set; }
    public List<MessageDTO> Messages { get; set; }
    
    public bool IsDeletedBySender { get; set; } = false;
    public bool IsDeletedByReceiver { get; set; } = false;
}