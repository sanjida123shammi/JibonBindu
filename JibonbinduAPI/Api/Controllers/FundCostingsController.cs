using Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;

namespace Api.Controllers
{
    /// <summary>
    /// Fund costings (money the foundation spent). The data lives in the DailyCost table.
    /// GET, PATCH and DELETE run through stored procedures; POST and PUT run through EF Core.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = AppRoles.FundManagers)]
    public class FundCostingsController : ControllerBase
    {
        private readonly IFundCostingRepository _costings;

        public FundCostingsController(IFundCostingRepository costings)
        {
            _costings = costings;
        }

        // GET api/fundcostings?from=2026-01-01&to=2026-12-31&spentByPersonId=3&settlementStatusId=1
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FundCostingResponse>>> Search([FromQuery] FundCostingFilter filter)
        {
            if (filter.From is not null && filter.To is not null && filter.From > filter.To)
                return BadRequest(new { message = "'from' cannot be after 'to'." });

            return Ok(await _costings.SearchAsync(filter));
        }

        // GET api/fundcostings/12
        [HttpGet("{id:int}")]
        public async Task<ActionResult<FundCostingResponse>> GetById(int id)
        {
            var item = await _costings.GetByIdAsync(id);
            return item is null ? NotFound() : Ok(item);
        }

        // POST api/fundcostings   (EF Core)
        [HttpPost]
        public async Task<ActionResult<FundCostingResponse>> Create([FromBody] FundCostingDTO dto)
        {
            var invalid = await ValidateAsync(dto);
            if (invalid is not null) return invalid;

            var created = await _costings.AddAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.FundCostingId }, created);
        }

        // PUT api/fundcostings/12   (EF Core)
        [HttpPut("{id:int}")]
        public async Task<ActionResult<FundCostingResponse>> Update(int id, [FromBody] FundCostingDTO dto)
        {
            if (await _costings.GetByIdAsync(id) is null) return NotFound();

            var invalid = await ValidateAsync(dto);
            if (invalid is not null) return invalid;

            var updated = await _costings.UpdateAsync(id, dto);
            return updated is null ? NotFound() : Ok(updated);
        }

        // PATCH api/fundcostings/12/settlement-status
        [HttpPatch("{id:int}/settlement-status")]
        public async Task<IActionResult> UpdateSettlementStatus(int id, [FromBody] UpdateSettlementStatusDTO dto)
        {
            var result = await _costings.UpdateSettlementStatusAsync(id, dto.SettlementStatusId);
            return result switch
            {
                StatusUpdateResult.Updated => (IActionResult)NoContent(),
                StatusUpdateResult.NotFound => NotFound(),
                _ => BadRequest(new { message = "The selected settlement status does not exist." })
            };
        }

        // DELETE api/fundcostings/12
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await _costings.DeleteAsync(id) ? NoContent() : NotFound();
        }

        // ---- helpers ----------------------------------------------------------------

        private async Task<ActionResult?> ValidateAsync(FundCostingDTO dto)
        {
            if (dto.CostingDate.Date > DateTime.Today)
                ModelState.AddModelError(nameof(dto.CostingDate), "Costing date cannot be in the future.");

            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var referenceError = await _costings.ValidateReferencesAsync(dto);
            if (referenceError is not null)
            {
                ModelState.AddModelError(string.Empty, referenceError);
                return ValidationProblem(ModelState);
            }

            return null;
        }
    }
}
