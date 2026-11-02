using Api.Data;
using SharedLibrary.DTOs;

namespace Api.Repositories
{
    public class FundDonationReportRepository : IFundDonationReportRepository
    {
        private readonly JBFIdentityDbContext _context;

        public FundDonationReportRepository(JBFIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<YearlyFundDonation>> GetYearlyAsync(int? fromYear, int? toYear)
        {
            return await _context.QueryProcAsync<YearlyFundDonation>(
                $"EXEC dbo.usp_FundDonationReport_Yearly @FromYear = {fromYear}, @ToYear = {toYear}");
        }

        public async Task<IEnumerable<MonthlyFundDonation>> GetMonthlyAsync(int? year)
        {
            return await _context.QueryProcAsync<MonthlyFundDonation>(
                $"EXEC dbo.usp_FundDonationReport_Monthly @Year = {year}");
        }
    }
}
