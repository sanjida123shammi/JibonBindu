using Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;
using System.Security.Claims;

namespace Api.Controllers
{
    /// <summary>
    /// Step 2 of the workflow: giving information as a blood donor.
    /// Step 3: a new donor registration notifies the Admin and the blood-searching team.
    /// Donor lists (which contain phone numbers) are visible only to Admin and team members.
    /// Data access is done by stored procedures through IBloodDonorRepository / INotificationRepository.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BloodDonorsController : ControllerBase
    {
        private static readonly string[] TeamRoles = { AppRoles.Admin, AppRoles.Member };

        private readonly IBloodDonorRepository _donors;
        private readonly INotificationRepository _notifications;
        private readonly ILogger<BloodDonorsController> _logger;

        public BloodDonorsController(
            IBloodDonorRepository donors,
            INotificationRepository notifications,
            ILogger<BloodDonorsController> logger)
        {
            _donors = donors;
            _notifications = notifications;
            _logger = logger;
        }

        private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // POST api/blooddonors/register
        [HttpPost("register")]
        public async Task<ActionResult<BloodDonorResponse>> Register([FromBody] BloodDonorDTO dto)
        {
            var userId = CurrentUserId;
            if (userId is null) return Unauthorized();

            ValidateDonorRules(dto);
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            if (await _donors.GetByUserIdAsync(userId) is not null)
                return Conflict(new { message = "You are already registered as a donor. Use PUT api/blooddonors/me to update your information." });

            var donor = await _donors.RegisterAsync(userId, dto);

            await TryNotifyTeamOfNewDonorAsync(donor, userId);

            return CreatedAtAction(nameof(GetMine), null, donor);
        }

        // GET api/blooddonors/me
        [HttpGet("me")]
        public async Task<ActionResult<BloodDonorResponse>> GetMine()
        {
            var userId = CurrentUserId;
            if (userId is null) return Unauthorized();

            var donor = await _donors.GetByUserIdAsync(userId);
            return donor is null ? NotFound(new { message = "You have not registered as a donor yet." }) : Ok(donor);
        }

        // PUT api/blooddonors/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMine([FromBody] BloodDonorDTO dto)
        {
            var userId = CurrentUserId;
            if (userId is null) return Unauthorized();

            ValidateDonorRules(dto);
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            return await _donors.UpdateByUserIdAsync(userId, dto)
                ? NoContent()
                : NotFound(new { message = "You have not registered as a donor yet." });
        }

        // GET api/blooddonors?bloodGroup=O%2B&district=Dhaka&area=Mirpur&availableOnly=true
        [HttpGet]
        [Authorize(Roles = AppRoles.AdminOrMember)]
        public async Task<ActionResult<IEnumerable<BloodDonorResponse>>> Search(
            [FromQuery] string? bloodGroup,
            [FromQuery] string? district,
            [FromQuery] string? area,
            [FromQuery] bool availableOnly = false,
            [FromQuery] DonationType donationType = DonationType.WholeBlood)
        {
            string? group = null;
            if (!string.IsNullOrWhiteSpace(bloodGroup))
            {
                if (!BloodGroupFormat.TryNormalize(bloodGroup, out var normalized))
                    return BadRequest(new { message = "Blood group must be A+, A-, B+, B-, AB+, AB-, O+ or O-." });
                group = normalized;
            }

            return Ok(await _donors.SearchAsync(group, district, area, availableOnly, donationType));
        }

        // GET api/blooddonors/7
        [HttpGet("{id:int}")]
        [Authorize(Roles = AppRoles.AdminOrMember)]
        public async Task<ActionResult<BloodDonorResponse>> GetById(int id)
        {
            var donor = await _donors.GetByIdAsync(id);
            return donor is null ? NotFound() : Ok(donor);
        }

        // DELETE api/blooddonors/7
        [HttpDelete("{id:int}")]
        [Authorize(Roles = AppRoles.Admin)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _donors.DeleteAsync(id);
            return result switch
            {
                DeleteResult.Deleted => (IActionResult)NoContent(),
                DeleteResult.NotFound => NotFound(),
                _ => Conflict(new { message = "This donor has donation history. Mark the donor as Unavailable instead of deleting." })
            };
        }

        // ---- helpers ----

        private void ValidateDonorRules(BloodDonorDTO dto)
        {
            var today = DateTime.Today;

            var age = today.Year - dto.DateOfBirth.Year;
            if (dto.DateOfBirth.Date > today.AddYears(-age)) age--;

            if (age < DonationRules.MinDonorAge || age > DonationRules.MaxDonorAge)
                ModelState.AddModelError(nameof(dto.DateOfBirth),
                    $"Donors must be between {DonationRules.MinDonorAge} and {DonationRules.MaxDonorAge} years old.");

            if (!Enum.IsDefined(typeof(DonationType), dto.LastDonationType))
                ModelState.AddModelError(nameof(dto.LastDonationType), "Unsupported donation type.");

            if (dto.LastDonationDate is { } last)
            {
                if (last.Date > today)
                    ModelState.AddModelError(nameof(dto.LastDonationDate), "Last donation date cannot be in the future.");
                else if (last.Date < dto.DateOfBirth.Date)
                    ModelState.AddModelError(nameof(dto.LastDonationDate), "Last donation date cannot be before the date of birth.");
            }
        }

        private async Task TryNotifyTeamOfNewDonorAsync(BloodDonorResponse donor, string donorUserId)
        {
            try
            {
                var place = string.Join(", ", new[] { donor.Area, donor.District }.Where(s => !string.IsNullOrWhiteSpace(s)));
                var title = $"New donor registered: {donor.BloodGroup}";
                var message = string.IsNullOrEmpty(place)
                    ? $"{donor.FullName} registered as a {donor.BloodGroup} donor."
                    : $"{donor.FullName} registered as a {donor.BloodGroup} donor from {place}.";

                await _notifications.NotifyRolesAsync(TeamRoles, donorUserId, title, message, NotificationTypes.NewDonorRegistered);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to notify the team about new donor {DonorId}", donor.BloodDonorId);
            }
        }
    }
}
