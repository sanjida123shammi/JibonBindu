using System.ComponentModel.DataAnnotations;

namespace SharedLibrary.DTOs
{
    public class AssignRoleDTO
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;
    }
}
