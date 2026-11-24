using Api.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;
using System.Security.Claims;

namespace Api.Controllers
{
    /// <summary>
    /// Step 2 of the workflow: giving a blood request (POST) and taking/browsing requests (GET).
    /// Step 3: creating a request notifies the Admin and the blood-searching team.
    /// Data access is done by stored procedures through ICaseRequestRepository / INotificationRepository.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CaseRequestsController : ControllerBase
    {
        private static readonly string[] TeamRoles = { AppRoles.Admin, AppRoles.Member };

        private readonly ICaseRequestRepository _cases;
        private readonly INotificationRepository _notifications;
        private readonly ILogger<CaseRequestsController> _logger;

        public CaseRequestsController(
            ICaseRequestRepository cases,
            INotificationRepository notifications,
            ILogger<CaseRequestsController> logger)
        {
            _cases = cases;
            _notifications = notifications;
            _logger = logger;
        }

        private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // GET api/caserequests
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CaseRequest>>> GetAll()
        {
            return Ok(await _cases.GetAllAsync());
        }

        // GET api/caserequests/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CaseRequest>> GetById(int id)
        {
            var item = await _cases.GetByIdAsync(id);
            return item is null ? NotFound() : Ok(item);
        }

        // GET api/caserequests/search?bloodGroup=A%2B&date=2026-11-02
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<CaseRequest>>> Search([FromQuery] string? bloodGroup, [FromQuery] DateTime? date)
        {
            string? group = null;
            if (!string.IsNullOrWhiteSpace(bloodGroup))
            {
                if (!BloodGroupFormat.TryNormalize(bloodGroup, out var normalized))
                    return BadRequest(new { message = "Blood group must be A+, A-, B+, B-, AB+, AB-, O+ or O-." });
                group = normalized;
            }

            return Ok(await _cases.SearchAsync(group, date));
        }

        // GET api/caserequests/mine
        [HttpGet("mine")]
        public async Task<ActionResult<IEnumerable<CaseRequest>>> GetMine()
        {
            var userId = CurrentUserId;
            if (userId is null) return Unauthorized();

            return Ok(await _cases.GetMyCasesAsync(userId));
        }

        // POST api/caserequests
        [HttpPost]
        public async Task<ActionResult<CaseRequest>> Create([FromBody] CaseRequest request)
        {
            var userId = CurrentUserId;
            if (userId is null) return Unauthorized();

            if (request.DonationDate < DateOnly.FromDateTime(DateTime.Today))
            {
                ModelState.AddModelError(nameof(request.DonationDate), "Donation date cannot be in the past.");
                return ValidationProblem(ModelState);
            }

            var created = await _cases.AddAsync(request, userId);

            await TryNotifyTeamOfNewRequestAsync(created, userId);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT api/caserequests/5   (owner or Admin)
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CaseRequest request)
        {
            if (await _cases.GetByIdAsync(id) is null) return NotFound();
            if (!await CanModifyAsync(id)) return Forbid(JwtBearerDefaults.AuthenticationScheme);

            request.Id = id;
            return await _cases.UpdateAsync(request) ? NoContent() : NotFound();
        }

        // PATCH api/caserequests/5/status   (Admin or team member)
        [HttpPatch("{id:int}/status")]
        [Authorize(Roles = AppRoles.AdminOrMember)]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateCaseStatusDTO dto)
        {
            var status = CaseStatusNames.All.FirstOrDefault(s => string.Equals(s, dto.Status, StringComparison.OrdinalIgnoreCase));
            if (status is null)
                return BadRequest(new { message = $"Status must be one of: {string.Join(", ", CaseStatusNames.All)}" });

            var existing = await _cases.GetByIdAsync(id);
            if (existing is null) return NotFound();

            if (!await _cases.UpdateStatusAsync(id, status)) return NotFound();

            await TryNotifyRequesterOfStatusChangeAsync(id, existing.BloodGroup, status);
            return NoContent();
        }

        // DELETE api/caserequests/5   (owner or Admin)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (await _cases.GetByIdAsync(id) is null) return NotFound();
            if (!await CanModifyAsync(id)) return Forbid(JwtBearerDefaults.AuthenticationScheme);

            var result = await _cases.DeleteAsync(id);
            return result switch
            {
                DeleteResult.Deleted => (IActionResult)NoContent(),
                DeleteResult.NotFound => NotFound(),
                _ => Conflict(new { message = "This request already has donation records. Set its status to Cancelled instead of deleting it." })
            };
        }

        // ---- helpers ----------------------------------------------------------------

        private async Task<bool> CanModifyAsync(int caseId)
        {
            if (User.IsInRole(AppRoles.Admin)) return true;

            var ownerId = await _cases.GetOwnerIdAsync(caseId);
            return ownerId is not null && ownerId == CurrentUserId;
        }

        /// <summary>
        /// Notifies Admins and blood-searching team members with one stored procedure call.
        /// A notification failure must never make the request itself fail, so errors are logged and swallowed.
        /// </summary>
        private async Task TryNotifyTeamOfNewRequestAsync(CaseRequest created, string requesterId)
        {
            try
            {
                var bags = created.BloodQuantity == 1 ? "bag" : "bags";
                var title = $"Blood needed: {created.BloodGroup} ({created.BloodQuantity} {bags})";
                var message = $"{created.HospitalName} on {created.DonationDate:dd MMM yyyy} at {created.DonationTime:hh\\:mm}. Contact: {created.ContactNo}.";

                await _notifications.NotifyRolesAsync(TeamRoles, requesterId, title, message, NotificationTypes.NewBloodRequest, created.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to notify the team about case {CaseId}", created.Id);
            }
        }

        private async Task TryNotifyRequesterOfStatusChangeAsync(int caseId, string bloodGroup, string status)
        {
            try
            {
                var ownerId = await _cases.GetOwnerIdAsync(caseId);
                if (ownerId is null || ownerId == CurrentUserId) return;

                await _notifications.CreateForUsersAsync(
                    new[] { ownerId },
                    "Blood request update",
                    $"Your request #{caseId} ({bloodGroup}) is now '{status}'.",
                    NotificationTypes.CaseStatusChanged,
                    caseId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to notify the requester of case {CaseId}", caseId);
            }
        }
    }
}
