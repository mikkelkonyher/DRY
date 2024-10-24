namespace DRYV1.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public int MusicGearId { get; set; } // Foreign key to MusicGear
        public int UserId { get; set; } // Foreign key to User
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
        public User User { get; set; } // Navigation property
  
    }
    
    public class CommentDTO
    {
        public int MusicGearId { get; set; }
        public int UserId { get; set; }
        public string Text { get; set; }
    }
}