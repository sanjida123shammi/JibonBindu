using System.ComponentModel.DataAnnotations;

namespace SharedLibrary.DTOs
{
    public class SslCommerzInitRequest
    {
        [Required]
        [Range(10, 500000, ErrorMessage = "Donation amount must be at least 10 BDT.")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Donor name is required.")]
        public string DonorName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Donor email is required.")]
        [EmailAddress]
        public string DonorEmail { get; set; } = string.Empty;

        [Required(ErrorMessage = "Contact number is required.")]
        public string DonorContactNo { get; set; } = string.Empty; // <-- Matches Angular's donorContactNo

        public string? DonorAddress { get; set; } = "Dhaka, Bangladesh";
        public string? City { get; set; } = "Dhaka";
        public string? Note { get; set; }
    }

    public class SslCommerzInitResponse
    {
        public bool Success { get; set; }
        public string? GatewayUrl { get; set; }
        public string? TranId { get; set; }
        public string? Message { get; set; }
    }

    public class SslCommerzGatewayInitResult
    {
        public string? status { get; set; }
        public string? failedreason { get; set; }
        public string? sessionkey { get; set; }
        public string? GatewayPageURL { get; set; }
    }

    public class SslCommerzCallbackDTO
    {
        public string? status { get; set; }
        public string? tran_date { get; set; }
        public string? tran_id { get; set; }
        public string? val_id { get; set; }
        public decimal amount { get; set; }
        public string? store_amount { get; set; }
        public string? currency { get; set; }
        public string? bank_tran_id { get; set; }
        public string? card_type { get; set; }
        public string? card_no { get; set; }
        public string? card_issuer { get; set; }
        public string? card_brand { get; set; }
        public string? error { get; set; }
        public string? value_a { get; set; } // Donor Name
        public string? value_b { get; set; } // Donor Email
        public string? value_c { get; set; } // Donor Phone
        public string? value_d { get; set; } // Note / Receiver
    }

    public class SslCommerzValidatorResponse
    {
        public string? status { get; set; }
        public string? tran_date { get; set; }
        public string? tran_id { get; set; }
        public string? val_id { get; set; }
        public string? amount { get; set; }
        public string? store_amount { get; set; }
        public string? currency { get; set; }
        public string? bank_tran_id { get; set; }
        public string? card_type { get; set; }
        public string? card_no { get; set; }
        public string? card_issuer { get; set; }
        public string? card_brand { get; set; }
        public string? error { get; set; }
    }
}