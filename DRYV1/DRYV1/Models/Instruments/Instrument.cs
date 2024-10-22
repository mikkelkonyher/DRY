using DRYV1.Interfaces;

namespace DRYV1.Models
{
    public class Instrument : IImageUploadable
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
        public int UserId { get; set; } // Foreign key property
    }
}