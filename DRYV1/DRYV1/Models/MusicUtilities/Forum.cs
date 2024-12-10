using System.ComponentModel.DataAnnotations;

namespace DRYV1.Models.MusicUtilities;

public class Forum
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Subject { get; set; }

    [Required]
    public string Body { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public int UserId { get; set; }

    public int LikeCount { get; set; }

    public List<Comment> Comments { get; set; } = new List<Comment>();
}

public class ForumUpdateDTO
{
    public int Id { get; set; }
    public string Subject { get; set; }
    public string Body { get; set; }
    public int UserId { get; set; }
    
}