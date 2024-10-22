using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace DRYV1.Services
{
    public static class ImageUploadHelper
    {
        public static async Task<List<string>> UploadImagesAsync(List<IFormFile> imageFiles, string uploadPath, int maxFiles = 8, long maxSize = 4 * 1024 * 1024)
        {
            var imagePaths = new List<string>();

            if (imageFiles.Count > maxFiles)
            {
                throw new InvalidOperationException($"You can upload a maximum of {maxFiles} images.");
            }

            foreach (var imageFile in imageFiles)
            {
                if (imageFile.Length > maxSize)
                {
                    throw new InvalidOperationException($"Each image must be less than {maxSize / (1024 * 1024)}MB.");
                }
                
                var extension = Path.GetExtension(imageFile.FileName).ToLower();
                if (extension != ".png" && extension != ".jpg" && extension != ".jpeg")
                {
                    throw new InvalidOperationException("Only PNG and JPG images are allowed.");
                }

                var filePath = Path.Combine(uploadPath, imageFile.FileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }
                imagePaths.Add(filePath);
            }

            return imagePaths;
        }
    }
}