using SharedLibrary.Constants;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Models
{
    public class BloodDonor
    {
        public int BloodDonorId { get; set; }

        public int PersonId { get; set; }
        public virtual Person Person { get; set; } = null!;

        public int BloodGroupId { get; set; }
        public virtual BloodGroup BloodGroup { get; set; } = null!;

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime? LastDonationDate { get; set; }

        public DonationType LastDonationType { get; set; } = DonationType.WholeBlood;

        public int DonorStatusId { get; set; }
        public virtual DonorStatus DonorStatus { get; set; } = null!;

        public int TotalDonation { get; set; }

        public string PreferredLocation { get; set; } = string.Empty;

        public string PreferredTime { get; set; } = string.Empty;

        public string Remarks { get; set; } = string.Empty;
    }
}
