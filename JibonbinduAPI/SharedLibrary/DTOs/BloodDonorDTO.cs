using SharedLibrary.Constants;
using System.ComponentModel.DataAnnotations;

namespace SharedLibrary.DTOs
{
    public class BloodDonorDTO
    {
        [Required, StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required, RegularExpression(@"^\+?[0-9]{11,14}$", ErrorMessage = "Contact number must be 11-14 digits, optionally starting with +.")]
        public string ContactNo { get; set; } = string.Empty;

        [StringLength(100)] public string District { get; set; } = string.Empty;
        [StringLength(100)] public string City { get; set; } = string.Empty;
        [StringLength(100)] public string Area { get; set; } = string.Empty;

        [Required, RegularExpression(@"^(A|B|AB|O)[+-]$", ErrorMessage = "Blood group must be A+, A-, B+, B-, AB+, AB-, O+ or O-.")]
        public string BloodGroup { get; set; } = string.Empty;

        public DateTime? LastDonationDate { get; set; }

        public DonationType LastDonationType { get; set; } = DonationType.WholeBlood;

        [StringLength(200)] public string PreferredLocation { get; set; } = string.Empty;
        [StringLength(100)] public string PreferredTime { get; set; } = string.Empty;
        [StringLength(500)] public string Remarks { get; set; } = string.Empty;

        public bool IsAvailable { get; set; } = true;
    }

    public class BloodDonorResponse
    {
        public int BloodDonorId { get; set; }
        public int PersonId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string ContactNo { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int TotalDonation { get; set; }
        public string PreferredLocation { get; set; } = string.Empty;
        public string PreferredTime { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public DateTime? LastDonationDate { get; set; }
        public DonationType LastDonationType { get; set; } = DonationType.WholeBlood;

        public DateTime? NextEligibleDate => LastDonationDate?.AddDays(DonationRules.GetIntervalDays(LastDonationType));
        public bool IsEligibleNow => NextEligibleDate is null || NextEligibleDate.Value.Date <= DateTime.Today;
    }
}
