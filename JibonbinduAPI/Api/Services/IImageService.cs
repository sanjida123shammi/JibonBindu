using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Api.Services
{
    public interface IImageService
    {
        Task<string> SaveImageAsync(IFormFile? file, string subFolder = "members");
        Task<string> SaveBase64ImageAsync(string base64String, string subFolder = "members");
        bool DeleteImage(string? relativePath);
    }
}