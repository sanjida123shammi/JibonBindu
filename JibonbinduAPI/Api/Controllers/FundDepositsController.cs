using Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;

namespace Api.Controllers
{
    /// <summary>
    /// Fund deposits (money donated to the foundation).
    /// GET and DELETE run through stored procedures; POST and PUT run through EF Core.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FundDepositsController : ControllerBase
    {
        private readonly IFundDepositRepository _deposits;

        public FundDepositsController(IFundDepositRepository deposits)
        {
            _deposits = deposits;
        }

        // GET api/funddeposits?from=2026-01-01&to=2026-12-31&fundDonorId=3&page=1&pageSize=50
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FundDepositResponse>>> Search([FromQuery] FundDepositFilter filter)
        {
            if (filter.From is not null && filter.To is not null && filter.From > filter.To)
                return BadRequest(new { message = "'from' cannot be after 'to'." });

            return Ok(await _deposits.SearchAsync(filter));
        }

        // GET api/funddeposits/12
        [HttpGet("{id:int}")]
        public async Task<ActionResult<FundDepositResponse>> GetById(int id)
        {
            var item = await _deposits.GetByIdAsync(id);
            return item is null ? NotFound() : Ok(item);
        }

        // POST api/funddeposits   (EF Core)
        [HttpPost]
        public async Task<ActionResult<FundDepositResponse>> Create([FromBody] FundDepositDTO dto)
        {
            var invalid = await ValidateAsync(dto);
            if (invalid is not null) return invalid;

            var created = await _deposits.AddAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.FundDepositId }, created);
        }

        // PUT api/funddeposits/12   (EF Core)
        [HttpPut("{id:int}")]
        public async Task<ActionResult<FundDepositResponse>> Update(int id, [FromBody] FundDepositDTO dto)
        {
            if (await _deposits.GetByIdAsync(id) is null) return NotFound();

            var invalid = await ValidateAsync(dto);
            if (invalid is not null) return invalid;

            var updated = await _deposits.UpdateAsync(id, dto);
            return updated is null ? NotFound() : Ok(updated);
        }

        // DELETE api/funddeposits/12
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await _deposits.DeleteAsync(id) ? NoContent() : NotFound();
        }

        // ---- helpers ----------------------------------------------------------------

        private async Task<ActionResult?> ValidateAsync(FundDepositDTO dto)
        {
            if (dto.FundDonationDate.Date > DateTime.Today)
                ModelState.AddModelError(nameof(dto.FundDonationDate), "Donation date cannot be in the future.");

            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var referenceError = await _deposits.ValidateReferencesAsync(dto);
            if (referenceError is not null)
            {
                ModelState.AddModelError(string.Empty, referenceError);
                return ValidationProblem(ModelState);
            }

            return null;
        }
    }
}
