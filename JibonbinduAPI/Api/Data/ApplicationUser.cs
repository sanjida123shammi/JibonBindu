using Microsoft.AspNetCore.Identity;

namespace Api.Data
{
    public class ApplicationUser : IdentityUser
    {
        public string? Name { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Location { get; set; }
    }
}