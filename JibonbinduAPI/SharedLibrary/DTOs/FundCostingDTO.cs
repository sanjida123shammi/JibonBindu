using System.ComponentModel.DataAnnotations;

namespace SharedLibrary.DTOs
{
    /// <summary>Input for creating / updating a fund costing (stored in the DailyCost table).</summary>
    public class FundCostingDTO
    {
        [Required]
        public DateTime CostingDate { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Select who spent the money.")]
        public int SpentByPersonId { get; set; }

        [Range(0.01, 100000000.0, ErrorMessage = "Cost amount must be greater than 0.")]
        public decimal CostAmount { get; set; }

        [Required, StringLength(300)]
        public string Purpose { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = "Select a settlement status.")]
        public int SettlementStatusId { get; set; }

        [StringLength(500)]
        public string Remarks { get; set; } = string.Empty;
    }

    /// <summary>Query-string filters for GET api/fundcostings. Every filter is optional.</summary>
    public class FundCostingFilter
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int? SpentByPersonId { get; set; }
        public int? SettlementStatusId { get; set; }

        [Range(1, int.MaxValue)]
        public int Page { get; set; } = 1;

        [Range(1, 200)]
        public int PageSize { get; set; } = 50;
    }

    public class UpdateSettlementStatusDTO
    {
        [Range(1, int.MaxValue, ErrorMessage = "Select a settlement status.")]
        public int SettlementStatusId { get; set; }
    }

    /// <summary>Output (keyless: filled from stored procedure columns of the same name).</summary>
    public class FundCostingResponse
    {
        public int FundCostingId { get; set; }
        public DateTime CostingDate { get; set; }
        public int SpentByPersonId { get; set; }
        public string SpentByName { get; set; } = string.Empty;
        public decimal CostAmount { get; set; }
        public string Purpose { get; set; } = string.Empty;
        public int SettlementStatusId { get; set; }
        public string SettlementStatusTitle { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
    }
}
