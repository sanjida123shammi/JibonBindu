using System.ComponentModel.DataAnnotations;

namespace SharedLibrary.DTOs
{
    /// <summary>One dropdown entry.</summary>
    public class LookupItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    /// <summary>Flat row returned by usp_FundLookup_GetAll (keyless).</summary>
    public class FundLookupRow
    {
        public string Kind { get; set; } = string.Empty;
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    /// <summary>All dropdown lists of the fund screens in one response.</summary>
    public class FundLookupsResponse
    {
        public List<LookupItem> DonationTypes { get; set; } = new();
        public List<LookupItem> FundingTypes { get; set; } = new();
        public List<LookupItem> CashTypes { get; set; } = new();
        public List<LookupItem> DonorTypes { get; set; } = new();
        public List<LookupItem> SettlementStatuses { get; set; } = new();
    }

    public class AddLookupDTO
    {
        [Required, StringLength(100)]
        public string Name { get; set; } = string.Empty;
    }

    /// <summary>Fund donor dropdown entry (keyless).</summary>
    public class FundDonorOption
    {
        public int FundDonorId { get; set; }
        public int PersonId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string ContactNo { get; set; } = string.Empty;
        public string DonorType { get; set; } = string.Empty;
        public string DonationSlot { get; set; } = string.Empty;
        public decimal PayAmount { get; set; }
    }

    /// <summary>Person dropdown entry, e.g. for "spent by" (keyless).</summary>
    public class PersonOption
    {
        public int PersonId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string ContactNo { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
