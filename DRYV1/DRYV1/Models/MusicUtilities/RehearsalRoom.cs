using DRYV1.Interfaces;

namespace DRYV1.Models.MusicUtilities;

public class RehearsalRoom : IImageUploadable
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string Location { get; set; } //Fyn, København, Sjælland, Jylland etc.
    public DateTime ListingDate { get; set; }
    public string Description { get; set; }
    public string PaymentType { get; set; } // payment per hour, day or per month
    public decimal Price { get; set; }
    public int RoomSize { get; set; }
    public string Type { get; set; } // rehearsal room, recording studio, music school etc.
    
    public int FavoriteCount { get; set; }
    public List<string> ImagePaths { get; set; } = new List<string>();
    
    public List<Comment> Comments { get; set; } = new List<Comment>();
    public int UserId { get; set; } // Foreign key property
    
}

public class RehearsalRoomUpdateDTO
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? Location { get; set; } // Fyn, København, Sjælland, Jylland etc.
    public string? Description { get; set; }
    public string? PaymentType { get; set; } // payment per hour, day or per month
    public decimal? Price { get; set; }
    public int? RoomSize { get; set; }
    public string Type { get; set; } // rehearsal room, recording studio, music school etc.
    public List<string>? ImagePaths { get; set; } = new List<string>();
    public List<string>? ImagesToDelete { get; set; } = new List<string>();
}