using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Services
{
    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _environment;
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        public ImageService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> SaveImageAsync(IFormFile? file, string subFolder = "members")
        {
            if (file == null || file.Length == 0)
                return string.Empty;

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                throw new InvalidOperationException($"Invalid image type '{ext}'. Allowed formats: {string.Join(", ", AllowedExtensions)}");

            var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var targetFolder = Path.Combine(webRoot, "images", subFolder);

            if (!Directory.Exists(targetFolder))
                Directory.CreateDirectory(targetFolder);

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var fullPath = Path.Combine(targetFolder, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/images/{subFolder}/{fileName}";
        }

        public async Task<string> SaveBase64ImageAsync(string base64String, string subFolder = "members")
        {
            if (string.IsNullOrWhiteSpace(base64String))
                return string.Empty;

            string ext = ".png";
            if (base64String.Contains(";base64,"))
            {
                var parts = base64String.Split(";base64,");
                var mimeType = parts[0].Replace("data:", "");
                ext = mimeType switch
                {
                    "image/jpeg" or "image/jpg" => ".jpg",
                    "image/png" => ".png",
                    "image/webp" => ".webp",
                    "image/gif" => ".gif",
                    _ => ".png"
                };
                base64String = parts[1];
            }

            var bytes = Convert.FromBase64String(base64String);
            var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var targetFolder = Path.Combine(webRoot, "images", subFolder);

            if (!Directory.Exists(targetFolder))
                Directory.CreateDirectory(targetFolder);

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var fullPath = Path.Combine(targetFolder, fileName);

            await File.WriteAllBytesAsync(fullPath, bytes);
            return $"/images/{subFolder}/{fileName}";
        }

        public bool DeleteImage(string? relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath))
                return false;

            try
            {
                var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var cleanPath = relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                var fullPath = Path.Combine(webRoot, cleanPath);

                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    return true;
                }
            }
            catch
            {
                // Ignore file system errors on cleanup
            }
            return false;
        }

        // Global static helper that can be called anytime directly without dependency injection
        public static async Task<string> SaveImageFileAsync(IFormFile? file, string webRootPath, string subFolder = "members")
        {
            if (file == null || file.Length == 0) return string.Empty;

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                throw new InvalidOperationException($"Invalid image type '{ext}'. Allowed formats: {string.Join(", ", AllowedExtensions)}");

            var targetFolder = Path.Combine(webRootPath, "images", subFolder);
            if (!Directory.Exists(targetFolder))
                Directory.CreateDirectory(targetFolder);

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var fullPath = Path.Combine(targetFolder, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/images/{subFolder}/{fileName}";
        }
    }
}