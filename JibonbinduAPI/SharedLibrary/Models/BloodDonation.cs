using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Models
{
    public class BloodDonation
    {
        public int BloodDonationId { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime DonationDate { get; set; }

        public int BloodDonorId { get; set; }
        public virtual BloodDonor BloodDonor { get; set; } = null!;

        public int BloodGroupId { get; set; }
        public virtual BloodGroup BloodGroup { get; set; } = null!;

        public int CaseInfoId { get; set; }
        public virtual CaseInfo CaseInfo { get; set; } = null!;
    }
}
