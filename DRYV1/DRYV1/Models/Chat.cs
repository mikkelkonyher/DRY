namespace DRYV1.Models.MusicUtilities;

public class Chat
{
    public int Id { get; set; }
    public string Subject { get; set; }
    public List<Message> Messages { get; set; } = new List<Message>();
}