namespace DRYV1.Models
{
    public class Guitar 
    {
        public int Id { get; set; }
        public DateTime ListingDate { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string Type { get; set; } //El, Akk, 12-strenget??, Banjo, mandolin,Guitarforstærker, guitar effekter, andet tilbehør til guitar, andet
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string Location { get; set; }
        public string Condition { get; set; }
        public int Year { get; set; }
        public int UserId { get; set; } // Foreign key property
    }
    
}