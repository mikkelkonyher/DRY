using DRYV1.Models.MusicUtilities;

namespace DRYV1.Models;

public class ForumLikes
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ForumId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Forum Forum { get; set; }
}