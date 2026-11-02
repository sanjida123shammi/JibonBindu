using SharedLibrary.DTOs;

namespace Api.Repositories
{
    /// <summary>Aggregates over the BloodDonations table. Everything uses stored procedures.</summary>
    public interface IBloodDonationReportRepository
    {
        /// <summary>Total donations per individual blood group (all groups listed, also with 0).</summary>
        Task<IEnumerable<BloodGroupDonationTotal>> GetByBloodGroupAsync(DateTime? from, DateTime? to);

        /// <summary>Total blood donations overall.</summary>
        Task<BloodDonationTotal> GetTotalAsync(DateTime? from, DateTime? to);

        /// <summary>Total donations per month. With a year: 12 rows. Without: every month that has donations.</summary>
        Task<IEnumerable<MonthlyBloodDonation>> GetMonthlyAsync(int? year);
    }
}
