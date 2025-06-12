using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System;

namespace DRYV1.Services
{
    // Hjælpeklasse til upload og sletning af billeder
    public static class ImageUploadHelper
    {
        // Upload flere billeder, returnerer liste af URL'er til de uploadede billeder
        public static async Task<List<string>> UploadImagesAsync(List<IFormFile> imageFiles, string uploadPath, string baseUrl, int maxFiles = 8, long maxSize = 4 * 1024 * 1024)
        {
            var imageUrls = new List<string>();

            // Tjekker om der uploades for mange filer
            if (imageFiles.Count > maxFiles)
            {
                throw new InvalidOperationException($"Du kan maksimalt uploade {maxFiles} billeder.");
            }

            // Sikrer at upload-mappen findes
            var fullUploadPath = Path.Combine("wwwroot", uploadPath);
            if (!Directory.Exists(fullUploadPath))
            {
                Directory.CreateDirectory(fullUploadPath);
            }

            foreach (var imageFile in imageFiles)
            {
                // Tjekker filstørrelse
                if (imageFile.Length > maxSize)
                {
                    throw new InvalidOperationException($"Hvert billede skal være mindre end {maxSize / (1024 * 1024)}MB.");
                }

                // Tjekker filtype
                var extension = Path.GetExtension(imageFile.FileName).ToLower();
                if (extension != ".png" && extension != ".jpg" && extension != ".jpeg" && extension != ".webp")
                {
                    throw new InvalidOperationException("Kun PNG, JPG og WEBP billeder er tilladt.");
                }

                // Genererer unikt filnavn og sti
                var fileName = Path.GetRandomFileName() + extension;
                var filePath = Path.Combine(fullUploadPath, fileName);

                // Komprimerer og gemmer billedet som JPEG
                using (var image = Image.Load(imageFile.OpenReadStream()))
                {
                    var encoder = new JpegEncoder
                    {
                        Quality = 30 // Juster kvaliteten her
                    };

                    await image.SaveAsync(filePath, encoder);
                }

                // Opretter URL til det uploadede billede
                var imageUrl = new Uri(new Uri(baseUrl), Path.Combine(uploadPath, fileName).Replace("\\", "/")).ToString();
                imageUrls.Add(imageUrl);
            }

            return imageUrls;
        }

        // Sletter flere billeder ud fra deres stier
        public static void DeleteImages(List<string> imagePaths)
        {
            foreach (var imagePath in imagePaths)
            {
                var fullPath = Path.Combine("wwwroot", imagePath);
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
            }
        }

        // Sletter et enkelt billede ud fra stien
        public static void DeleteImage(string imagePath)
        {
            var fullPath = Path.Combine("wwwroot", imagePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
    }
}