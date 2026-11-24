using SharedLibrary.Constants;

namespace SharedLibrary.DTOs
{
    /// <summary>Total fund donations of one year (keyless).</summary>
    public class YearlyFundDonation
    {
        public int Year { get; set; }
        public decimal TotalAmount { get; set; }
        public int DepositCount { get; set; }
        public int DistinctDonors { get; set; }
    }

    /// <summary>Total fund donations of one calendar month (keyless).</summary>
    public class MonthlyFundDonation
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal TotalAmount { get; set; }
        public int DepositCount { get; set; }
        public int DistinctDonors { get; set; }

        // computed, not a database column
        public string MonthName => MonthNames.Get(Month);
    }

    /// <summary>Yearly totals plus the monthly totals of one year, in one response.</summary>
    public class FundDonationSummary
    {
        public decimal GrandTotalAmount { get; set; }
        public int TotalDeposits { get; set; }
        public List<YearlyFundDonation> Yearly { get; set; } = new();
        public int MonthlyYear { get; set; }
        public List<MonthlyFundDonation> Monthly { get; set; } = new();
    }
}
