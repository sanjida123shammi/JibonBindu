using System;
using System.ComponentModel.DataAnnotations;

namespace SharedLibrary.DTOs
{
    public class MemberDTO
    {
        // Person properties
        [Required, StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required, RegularExpression(@"^\+?[0-9]{11,14}$", ErrorMessage = "Contact number must be 11-14 digits, optionally starting with +.")]
        public string ContactNumber { get; set; } = string.Empty;

        [StringLength(100)] public string District { get; set; } = string.Empty;
        [StringLength(100)] public string City { get; set; } = string.Empty;
        [StringLength(100)] public string Area { get; set; } = string.Empty;

        // Member properties (At least one of NIDNumber or BirthCertificateNo is required)
        [StringLength(50)]
        public string? NIDNumber { get; set; }

        [StringLength(50)]
        public string? BirthCertificateNo { get; set; }

        [EmailAddress, StringLength(150)]
        public string? Email { get; set; }

        public string? ImageUrl { get; set; }

        public int? PersonRoleId { get; set; }
    }

    public class MemberResponseDTO
    {
        public string MemberID { get; set; } = string.Empty;
        public int PersonId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string ContactNumber { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string? NIDNumber { get; set; }
        public string? BirthCertificateNo { get; set; }
        public string? Email { get; set; }
        public string? ImageUrl { get; set; }
        public int PersonRoleID { get; set; }
        public string RoleName { get; set; } = string.Empty;
    }

    /// <summary>
    /// Lightweight DTO for a "Want to be a member" self-service request.
    /// Does NOT save to dbo.Members; just triggers an Admin notification.
    /// </summary>
    public class MemberRequestDTO
    {
        [Required, StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required, RegularExpression(@"^\+?[0-9]{11,14}$", ErrorMessage = "Contact number must be 11-14 digits.")]
        public string ContactNumber { get; set; } = string.Empty;

        [EmailAddress, StringLength(150)]
        public string? Email { get; set; }
    }
}
