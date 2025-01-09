namespace DRYV1.Models;

public class Message
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    public string Content { get; set; }
    public string? Subject { get; set; }
    
    public bool IsReadSender { get; set; } = false;
    public bool IsReadReceiver { get; set; } = false;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public int ChatId { get; set; }
    
    public Chat Chat { get; set; }

}

public class MessageDTO
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public string SenderUsername { get; set; }
    public int ReceiverId { get; set; }
    public string ReceiverUsername { get; set; }
    public string Content { get; set; }
    
    public string? Subject { get; set; }
    
    public bool IsReadSender { get; set; } = false;
    public bool IsReadReceiver { get; set; } = false;
    public DateTime Timestamp { get; set; }
    
    public int ChatId { get; set; }
    
    
}

public class MessageCreateDTO
{
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    
    public string? Subject { get; set; }

    public string Content { get; set; }
    
    public int ChatId { get; set; }
    
    
}

