using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Models
{
    public class DailyCost
    {
        public int DailyCostId { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime CostingDate { get; set; }

        public int SpentByPersonId { get; set; }
        public virtual Person Person { get; set; } = null!;

        public decimal CostAmount { get; set; }

        public string Purpose { get; set; } = string.Empty;

        public int SettlementStatusId { get; set; }
        public virtual SettlementStatus SettlementStatus { get; set; } = null!;

        public string Remarks { get; set; } = string.Empty;
    }
}
