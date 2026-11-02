using Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;

namespace Api.Controllers
{
    /// <summary>
    /// Aggregates of blood donations: total per individual blood group, total donations, total per month.
    /// Every action runs through a stored procedure. One BloodDonations row counts as one donation.
    /// </summary>
    [ApiController]
    [Route("api/reports/blood-donations")]
    [Authorize(Roles = AppRoles.AdminOrMember)]
    public class BloodDonationReportsController : ControllerBase
    {
        private readonly IBloodDonationReportRepository _reports;

        public BloodDonationReportsController(IBloodDonationReportRepository reports)
        {
            _reports = reports;
        }

        // GET api/reports/blood-donations/by-blood-group?from=2026-01-01&to=2026-12-31
        [HttpGet("by-blood-group")]
        public async Task<ActionResult<IEnumerable<BloodGroupDonationTotal>>> ByBloodGroup([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var invalid = ValidateRange(from, to);
            if (invalid is not null) return invalid;

            return Ok(await _reports.GetByBloodGroupAsync(from, to));
        }

        // GET api/reports/blood-donations/total?from=...&to=...
        [HttpGet("total")]
        public async Task<ActionResult<BloodDonationTotal>> Total([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var invalid = ValidateRange(from, to);
            if (invalid is not null) return invalid;

            return Ok(await _reports.GetTotalAsync(from, to));
        }

        // GET api/reports/blood-donations/monthly?year=2026   (without year: every month that has donations)
        [HttpGet("monthly")]
        public async Task<ActionResult<IEnumerable<MonthlyBloodDonation>>> Monthly([FromQuery] int? year)
        {
            var invalid = ValidateYear(year);
            if (invalid is not null) return invalid;

            return Ok(await _reports.GetMonthlyAsync(year));
        }

        // GET api/reports/blood-donations/summary?year=2026   (without year: all time)
        [HttpGet("summary")]
        public async Task<ActionResult<BloodDonationSummary>> Summary([FromQuery] int? year)
        {
            var invalid = ValidateYear(year);
            if (invalid is not null) return invalid;

            DateTime? from = null;
            DateTime? to = null;
            if (year is not null)
            {
                from = new DateTime(year.Value, 1, 1);
                to = new DateTime(year.Value, 12, 31);
            }

            return Ok(new BloodDonationSummary
            {
                Year = year,
                Total = await _reports.GetTotalAsync(from, to),
                ByBloodGroup = (await _reports.GetByBloodGroupAsync(from, to)).ToList(),
                Monthly = (await _reports.GetMonthlyAsync(year)).ToList()
            });
        }

        // ---- helpers ----------------------------------------------------------------

        private ActionResult? ValidateRange(DateTime? from, DateTime? to)
        {
            if (from is not null && to is not null && from > to)
                return BadRequest(new { message = "'from' cannot be after 'to'." });
            return null;
        }

        private ActionResult? ValidateYear(int? year)
        {
            if (year is < ReportRules.MinYear or > ReportRules.MaxYear)
                return BadRequest(new { message = $"Year must be between {ReportRules.MinYear} and {ReportRules.MaxYear}." });
            return null;
        }
    }
}
