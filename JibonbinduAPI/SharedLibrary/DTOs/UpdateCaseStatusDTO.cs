using System.ComponentModel.DataAnnotations;

namespace SharedLibrary.DTOs
{
    public class UpdateCaseStatusDTO
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
