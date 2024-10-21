namespace DRYV1.Models
{
    public class Drums 
    {
        public int Id { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string Type { get; set; }
        public string Color { get; set; }
        public string Description { get; set; }
        
        public int UserId { get; set; } // Foreign key property
    }
}