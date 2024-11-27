using DRYV1.Interfaces;

namespace DRYV1.Models
{
    public class MusicGear : IImageUploadable
    {
        public int Id { get; set; }
        public DateTime ListingDate { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string Location { get; set; }
        public string Condition { get; set; }
        public int Year { get; set; }
        public List<string> ImagePaths { get; set; } = new List<string>();
        public List<Comment> Comments { get; set; } = new List<Comment>();
        public int UserId { get; set; } // Foreign key property
        public int FavoriteCount { get; set; }
    }
    
    public class MusicGearUpdateDTO
    {
        public int Id { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public string? Location { get; set; }
        public string? Condition { get; set; }
        public int? Year { get; set; }
        
        public List<string>? ImagePaths { get; set; } = new List<string>();
        
        public List<string>? ImagesToDelete { get; set; } = new List<string>();
    }
}