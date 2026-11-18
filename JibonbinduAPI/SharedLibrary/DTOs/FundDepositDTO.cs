using System.ComponentModel.DataAnnotations;

namespace SharedLibrary.DTOs
{
    /// <summary>Input for creating / updating a fund deposit.</summary>
    public class FundDepositDTO
    {
        [Required]
        public DateTime FundDonationDate { get; set; }

        public int? FundDonorTypeId { get; set; }

        public int? FundDonorId { get; set; }

        [Required, StringLength(150)]
        public string DonorName { get; set; } = string.Empty;

        [StringLength(30)]
        public string? DonorContactNo { get; set; }

        [Range(0.01, 100000000.0, ErrorMessage = "Amount must be greater than 0.")]
        public decimal Amount { get; set; }

        [StringLength(200)]
        public string? FundReceiver { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Select a funding type.")]
        public int FundingTypeId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Select a cash type.")]
        public int CashTypeId { get; set; }

        /// <summary>Free text: the month(s) this payment is for, e.g. "January" or "Jan-Mar".</summary>
        [StringLength(100)]
        public string Months { get; set; } = string.Empty;
    }

    /// <summary>Query-string filters for GET api/funddeposits. Every filter is optional.</summary>
    public class FundDepositFilter
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int? FundDonorId { get; set; }
        public int? FundDonorTypeId { get; set; }
        public int? FundingTypeId { get; set; }
        public int? CashTypeId { get; set; }

        [Range(1, int.MaxValue)]
        public int Page { get; set; } = 1;

        [Range(1, 200)]
        public int PageSize { get; set; } = 50;
    }

    /// <summary>Output (keyless: filled from stored procedure columns of the same name).</summary>
    public class FundDepositResponse
    {
        public int FundDepositId { get; set; }
        public DateTime FundDonationDate { get; set; }
        public int FundDonorId { get; set; }
        public int FundDonorTypeId { get; set; }
        public string FundDonorTypeName { get; set; } = string.Empty;
        public string DonorName { get; set; } = string.Empty;
        public string DonorContactNo { get; set; } = string.Empty;
        public string DonationSlot { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? FundReceiver { get; set; }
        public int FundingTypeId { get; set; }
        public string FundingTypeName { get; set; } = string.Empty;
        public int CashTypeId { get; set; }
        public string CashTypeName { get; set; } = string.Empty;
        public string Months { get; set; } = string.Empty;
        public string? MemberId { get; set; }
    }
}