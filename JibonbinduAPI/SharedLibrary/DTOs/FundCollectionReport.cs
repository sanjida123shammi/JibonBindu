using SharedLibrary.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.DTOs
{
    public class FundCollectionReport
    {
        public int FundDonorId { get; set; }

        public int PersonId { get; set; }
        public virtual Person Person { get; set; } = null!;

        public string DonationSlot { get; set; } = string.Empty;

        public int Year { get; set; }
        
        public decimal Jan { get; set; }
        public decimal Feb { get; set; }
        public decimal March { get; set; }
        public decimal April { get; set; }
        public decimal May { get; set; }
        public decimal June { get; set; }
        public decimal July { get; set; }
        public decimal August { get; set; }
        public decimal Sept { get; set; }
        public decimal Oct { get; set; }
        public decimal Nov { get; set; }
        public decimal Dec { get; set; }

        public decimal TotalYearlyAmount =>
            Jan + Feb + March + April + May + June + July + August + Sept + Oct + Nov + Dec;
    }
}
