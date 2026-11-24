using Api.Data;
using SharedLibrary.DTOs;

namespace Api.Repositories
{
    public class BloodDonationReportRepository : IBloodDonationReportRepository
    {
        private readonly JBFIdentityDbContext _context;

        public BloodDonationReportRepository(JBFIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BloodGroupDonationTotal>> GetByBloodGroupAsync(DateTime? from, DateTime? to)
        {
            return await _context.QueryProcAsync<BloodGroupDonationTotal>(
                $"EXEC dbo.usp_BloodDonationReport_ByBloodGroup @From = {from}, @To = {to}");
        }

        public async Task<BloodDonationTotal> GetTotalAsync(DateTime? from, DateTime? to)
        {
            var total = await _context.QueryProcSingleAsync<BloodDonationTotal>(
                $"EXEC dbo.usp_BloodDonationReport_Total @From = {from}, @To = {to}");

            return total ?? new BloodDonationTotal();
        }

        public async Task<IEnumerable<MonthlyBloodDonation>> GetMonthlyAsync(int? year)
        {
            return await _context.QueryProcAsync<MonthlyBloodDonation>(
                $"EXEC dbo.usp_BloodDonationReport_Monthly @Year = {year}");
        }
    }
}
