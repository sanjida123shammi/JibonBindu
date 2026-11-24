using Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;

namespace Api.Controllers
{
    /// <summary>
    /// Aggregates of fund donations: total per year and total per month.
    /// Every action runs through a stored procedure. Based on FundDonationDate and Amount of the fund deposits.
    /// </summary>
    [ApiController]
    [Route("api/reports/fund-donations")]
    [Authorize(Roles = AppRoles.FundManagers)]
    public class FundDonationReportsController : ControllerBase
    {
        private readonly IFundDonationReportRepository _reports;

        public FundDonationReportsController(IFundDonationReportRepository reports)
        {
            _reports = reports;
        }

        // GET api/reports/fund-donations/yearly?fromYear=2023&toYear=2026
        [HttpGet("yearly")]
        public async Task<ActionResult<IEnumerable<YearlyFundDonation>>> Yearly([FromQuery] int? fromYear, [FromQuery] int? toYear)
        {
            var invalid = ValidateYear(fromYear) ?? ValidateYear(toYear);
            if (invalid is not null) return invalid;

            if (fromYear is not null && toYear is not null && fromYear > toYear)
                return BadRequest(new { message = "'fromYear' cannot be after 'toYear'." });

            return Ok(await _reports.GetYearlyAsync(fromYear, toYear));
        }

        // GET api/reports/fund-donations/monthly?year=2026   (without year: every month that has deposits)
        [HttpGet("monthly")]
        public async Task<ActionResult<IEnumerable<MonthlyFundDonation>>> Monthly([FromQuery] int? year)
        {
            var invalid = ValidateYear(year);
            if (invalid is not null) return invalid;

            return Ok(await _reports.GetMonthlyAsync(year));
        }

        // GET api/reports/fund-donations/summary?year=2026   (year only picks the monthly table; default = this year)
        [HttpGet("summary")]
        public async Task<ActionResult<FundDonationSummary>> Summary([FromQuery] int? year)
        {
            var invalid = ValidateYear(year);
            if (invalid is not null) return invalid;

            var monthlyYear = year ?? DateTime.Today.Year;
            var yearly = (await _reports.GetYearlyAsync(null, null)).ToList();

            return Ok(new FundDonationSummary
            {
                GrandTotalAmount = yearly.Sum(y => y.TotalAmount),
                TotalDeposits = yearly.Sum(y => y.DepositCount),
                Yearly = yearly,
                MonthlyYear = monthlyYear,
                Monthly = (await _reports.GetMonthlyAsync(monthlyYear)).ToList()
            });
        }

        // ---- helpers ----------------------------------------------------------------

        private ActionResult? ValidateYear(int? year)
        {
            if (year is < ReportRules.MinYear or > ReportRules.MaxYear)
                return BadRequest(new { message = $"Year must be between {ReportRules.MinYear} and {ReportRules.MaxYear}." });
            return null;
        }
    }
}
