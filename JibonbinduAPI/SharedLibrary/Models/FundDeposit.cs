using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Models
{
    public class FundDeposit
    {
        public int FundDepositId { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime FundDonationDate { get; set; }

        public int FundDonorId { get; set; }
        public virtual FundDonor FundDonor { get; set; } = null!;

        public decimal Amount { get; set; }

        public string? FundReceiver { get; set; }

        public int FundingTypeId { get; set; }
        public virtual FundingType FundingType { get; set; } = null!;

        public int CashTypeId { get; set; }
        public virtual CashType CashType { get; set; } = null!;

        public string Months { get; set; } = string.Empty;
    }
}
