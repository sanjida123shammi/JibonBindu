using SharedLibrary.Constants;

namespace SharedLibrary.DTOs
{
    /// <summary>Donations of one blood group. Every blood group is listed, even with 0 donations (keyless).</summary>
    public class BloodGroupDonationTotal
    {
        public int BloodGroupId { get; set; }
        public string BloodGroup { get; set; } = string.Empty;
        public int TotalDonations { get; set; }
        public int DistinctDonors { get; set; }
    }

    /// <summary>All blood donations together (keyless).</summary>
    public class BloodDonationTotal
    {
        public int TotalDonations { get; set; }
        public int DistinctDonors { get; set; }
        public DateTime? FirstDonationDate { get; set; }
        public DateTime? LastDonationDate { get; set; }
    }

    /// <summary>Donations in one calendar month (keyless).</summary>
    public class MonthlyBloodDonation
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int TotalDonations { get; set; }
        public int DistinctDonors { get; set; }

        // computed, not a database column
        public string MonthName => MonthNames.Get(Month);
    }

    /// <summary>Everything above in one response (for a dashboard).</summary>
    public class BloodDonationSummary
    {
        /// <summary>Null = all time.</summary>
        public int? Year { get; set; }
        public BloodDonationTotal Total { get; set; } = new();
        public List<BloodGroupDonationTotal> ByBloodGroup { get; set; } = new();
        public List<MonthlyBloodDonation> Monthly { get; set; } = new();
    }
}
