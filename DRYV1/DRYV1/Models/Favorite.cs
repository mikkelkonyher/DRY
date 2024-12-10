//MusicGear favorites

namespace DRYV1.Models
{
    public class Favorite
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MusicGearId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public MusicGear MusicGear { get; set; }
    }
}