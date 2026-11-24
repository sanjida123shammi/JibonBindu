using SharedLibrary.Common.Converters;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace SharedLibrary.Models
{
    public class CaseInfo
    {
        public int CaseInfoId { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime Date { get; set; } = DateTime.UtcNow;

        public int BloodGroupId { get; set; }
        public virtual BloodGroup BloodGroup { get; set; } = null!;

        public required string PatientProblem { get; set; }

        public int Quantity { get; set; }

        public decimal Hemoglobin { get; set; }

        [JsonPropertyName("donationDate")]
        public DateOnly DonationDate { get; set; }

        [JsonConverter(typeof(TimeOnlyAmPmConverter))]
        public TimeOnly DonationTime { get; set; }

        public string DonationPlace { get; set; } = string.Empty;

        [MaxLength(14)]
        public required string ContactNumber { get; set; }

        /// <summary>True when the requester is the patient / the patient's own family.</summary>
        public bool IsYourCase { get; set; }

        /// <summary>ApplicationUser.Id of whoever submitted the request.</summary>
        public string? RequestedByUserId { get; set; }

        public int CaseStatusId { get; set; }
        public virtual CaseStatus CaseStatus { get; set; } = null!;

        public int? HandledById { get; set; }
        public virtual CaseAssociate? HandledBy { get; set; }

        public int? FirstUpdateId { get; set; }
        public virtual CaseAssociate? FirstUpdate { get; set; }

        public int? VolunteerAssociateId { get; set; }
        public virtual VolunteerAssociate? VolunteerAssociate { get; set; }

        public string Remarks { get; set; } = string.Empty;
    }
}
