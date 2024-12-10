using DRYV1.Models.MusicUtilities;

namespace DRYV1.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public int? MusicGearId { get; set; } // Foreign key to MusicGear
        public int? RehearsalRoomId { get; set; } // Foreign key to RehearsalRoom
        
        public int? ForumId { get; set; } // Foreign key to Forum
        public int UserId { get; set; } // Foreign key to User
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
        public User User { get; set; } // Navigation property
        public MusicGear MusicGear { get; set; } // Navigation property
        public RehearsalRoom RehearsalRoom { get; set; } // Navigation property
        public Forum Forum { get; set; } // Navigation property
    }

    public class CommentDTO
    {
        public int? MusicGearId { get; set; }
        public int? RehearsalRoomId { get; set; }
        
        public int? ForumId { get; set; }
        public int UserId { get; set; }
        public string Text { get; set; }
    }
}