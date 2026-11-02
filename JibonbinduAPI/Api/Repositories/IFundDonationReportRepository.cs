using SharedLibrary.DTOs;

namespace Api.Repositories
{
    /// <summary>Aggregates over the FundDeposits table. Everything uses stored procedures.</summary>
    public interface IFundDonationReportRepository
    {
        /// <summary>Total fund donations per year (only years that have deposits).</summary>
        Task<IEnumerable<YearlyFundDonation>> GetYearlyAsync(int? fromYear, int? toYear);

        /// <summary>Total fund donations per month. With a year: 12 rows. Without: every month that has deposits.</summary>
        Task<IEnumerable<MonthlyFundDonation>> GetMonthlyAsync(int? year);
    }
}
