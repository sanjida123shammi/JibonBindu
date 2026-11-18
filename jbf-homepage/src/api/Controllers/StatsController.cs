using Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // Public endpoint for homepage visitors
    public class StatsController : ControllerBase
    {
        private readonly JBFIdentityDbContext _context;

        public StatsController(JBFIdentityDbContext context)
        {
            _context = context;
        }

        public class CounterStatsDTO
        {
            public int TotalDonation { get; set; }
            public int TotalCase { get; set; }
            public int TotalDonor { get; set; }
            public int TotalMember { get; set; }
        }

        /// <summary>
        /// Returns live aggregated counts for the public homepage counter section.
        /// </summary>
        [HttpGet("counter")]
        public async Task<ActionResult<CounterStatsDTO>> GetCounterStats()
        {
            // 1. Total blood donations count
            var totalDonation = await _context.BloodDonations.CountAsync();

            // 2. Total patient case requests
            var totalCase = await _context.CaseInfos.CountAsync();

            // 3. Total registered blood donors
            var totalDonor = await _context.BloodDonors.CountAsync();

            // 4. Total active foundation members
            var totalMember = await _context.Members.CountAsync();

            return Ok(new CounterStatsDTO
            {
                TotalDonation = totalDonation,
                TotalCase = totalCase,
                TotalDonor = totalDonor,
                TotalMember = totalMember
            });
        }
    }
}