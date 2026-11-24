using SharedLibrary.Common.Converters;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SharedLibrary.DTOs
{
    public class CaseRequest
    {
        public int Id { get; set; }

        [Required, StringLength(500)]
        public string PatientProblem { get; set; } = string.Empty;

        [Required, RegularExpression(@"^(A|B|AB|O)[+-]$", ErrorMessage = "Blood group must be A+, A-, B+, B-, AB+, AB-, O+ or O-.")]
        public string BloodGroup { get; set; } = string.Empty;

        [Range(1.0, 25.0, ErrorMessage = "Hemoglobin must be between 1 and 25 g/dL.")]
        public decimal Hemoglobin { get; set; }

        [Range(1, 20, ErrorMessage = "Blood quantity must be between 1 and 20 bags.")]
        public int BloodQuantity { get; set; }

        [Required, StringLength(200)]
        public string HospitalName { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("donationDate")]
        public DateOnly DonationDate { get; set; }


        [Required]
        [JsonConverter(typeof(TimeOnlyAmPmConverter))]
        public TimeOnly DonationTime { get; set; }

        [Required, RegularExpression(@"^\+?[0-9]{11,14}$", ErrorMessage = "Contact number must be 11-14 digits, optionally starting with +.")]
        public string ContactNo { get; set; } = string.Empty;

        public bool IsYourCase { get; set; }

        /// Set by the server (Pending, In Progress, Fulfilled, Cancelled). Ignored on input.
        public string Status { get; set; } = string.Empty;
    }
}
