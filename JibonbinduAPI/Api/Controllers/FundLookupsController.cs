using Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;

namespace Api.Controllers
{
    /// <summary>
    /// Dropdown data for the deposit and costing forms.
    /// GET runs through stored procedures; POST (adding a lookup value) runs through EF Core.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FundLookupsController : ControllerBase
    {
        private readonly IFundLookupRepository _lookups;

        public FundLookupsController(IFundLookupRepository lookups)
        {
            _lookups = lookups;
        }

        // GET api/fundlookups   -> donation types, funding types, cash types, donor types, settlement statuses
        [HttpGet]
        public async Task<ActionResult<FundLookupsResponse>> GetAll()
        {
            return Ok(await _lookups.GetAllAsync());
        }

        // GET api/fundlookups/fund-donors?search=rahim
        [HttpGet("fund-donors")]
        public async Task<ActionResult<IEnumerable<FundDonorOption>>> GetFundDonors([FromQuery] string? search, [FromQuery] int take = 100)
        {
            return Ok(await _lookups.GetFundDonorOptionsAsync(search, take));
        }

        // GET api/fundlookups/people?search=017
        [HttpGet("people")]
        public async Task<ActionResult<IEnumerable<PersonOption>>> GetPeople([FromQuery] string? search, [FromQuery] int take = 50)
        {
            return Ok(await _lookups.GetPersonOptionsAsync(search, take));
        }

        // POST api/fundlookups/cash-types   { "name": "Cash" }
        // kinds: donation-types, funding-types, cash-types, donor-types, settlement-statuses
        [HttpPost("{kind}")]
        public async Task<ActionResult<LookupItem>> Add(string kind, [FromBody] AddLookupDTO dto)
        {
            kind = kind.Trim().ToLowerInvariant();
            if (!FundLookupKinds.All.Contains(kind))
                return NotFound(new { message = $"Unknown lookup. Use one of: {string.Join(", ", FundLookupKinds.All)}" });

            var created = await _lookups.AddAsync(kind, dto.Name);
            if (created is null)
                return Conflict(new { message = $"'{dto.Name.Trim()}' already exists." });

            return Ok(created);
        }
    }
}
