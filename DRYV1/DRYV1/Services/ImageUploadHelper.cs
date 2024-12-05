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
    public static class ImageUploadHelper
    {
        public static async Task<List<string>> UploadImagesAsync(List<IFormFile> imageFiles, string uploadPath, string baseUrl, int maxFiles = 8, long maxSize = 4 * 1024 * 1024)
        {
            var imageUrls = new List<string>();

            if (imageFiles.Count > maxFiles)
            {
                throw new InvalidOperationException($"You can upload a maximum of {maxFiles} images.");
            }

            // Ensure the upload directory exists
            var fullUploadPath = Path.Combine("wwwroot", uploadPath);
            if (!Directory.Exists(fullUploadPath))
            {
                Directory.CreateDirectory(fullUploadPath);
            }

            foreach (var imageFile in imageFiles)
            {
                if (imageFile.Length > maxSize)
                {
                    throw new InvalidOperationException($"Each image must be less than {maxSize / (1024 * 1024)}MB.");
                }

                var extension = Path.GetExtension(imageFile.FileName).ToLower();
                if (extension != ".png" && extension != ".jpg" && extension != ".jpeg" && extension != ".webp")
                {
                    throw new InvalidOperationException("Only PNG, JPG, and WEBP images are allowed.");
                }

                var fileName = Path.GetRandomFileName() + extension;
                var filePath = Path.Combine(fullUploadPath, fileName);

                using (var image = Image.Load(imageFile.OpenReadStream()))
                {
                    
                    var encoder = new JpegEncoder
                    {
                        Quality = 30 // adjust this value to change the image quality
                    };

                    await image.SaveAsync(filePath, encoder);
                }

                var imageUrl = new Uri(new Uri(baseUrl), Path.Combine(uploadPath, fileName).Replace("\\", "/")).ToString();
                imageUrls.Add(imageUrl);
            }

            return imageUrls;
        }

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