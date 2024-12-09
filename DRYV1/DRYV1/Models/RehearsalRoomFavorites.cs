using DRYV1.Models.MusicUtilities;

namespace DRYV1.Models;

public class RehearsalRoomFavorites
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int RehearsalRoomid { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public RehearsalRoom RehearsalRoom { get; set; }
}