using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Models
{
    public class FundDonor
    {
        public int FundDonorId { get; set; }

        public int PersonId { get; set; }
        public virtual Person Person { get; set; } = null!;

        public int FundDonorTypeId { get; set; }
        public virtual FundDonorType FundDonorType { get; set; } = null!;

        public string DonationSlot { get; set; } = string.Empty;

        public decimal PayAmount { get; set; }
    }
}
