namespace DRYV1.Models
{
    public class Drums 
    {
        public int Id { get; set; }
        public DateTime ListingDate { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string Type { get; set; } //Snare, cymbals, kick, trommesæt, hihat, Floor tomb, racktom, tilbehør
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string Location { get; set; }
        public string Condition { get; set; }
        public int Year { get; set; }
        public int UserId { get; set; } // Foreign key property
    }
}