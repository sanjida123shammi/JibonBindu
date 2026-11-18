using Api.Repositories;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;
using SharedLibrary.Models;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MembersController : ControllerBase
    {
        private readonly IMemberRepository _memberRepo;
        private readonly IImageService _imageService;
        private readonly INotificationRepository _notifications;
        private readonly IUserRepository _users;

        public MembersController(
            IMemberRepository memberRepo,
            IImageService imageService,
            INotificationRepository notifications,
            IUserRepository users)
        {
            _memberRepo = memberRepo;
            _imageService = imageService;
            _notifications = notifications;
            _users = users;
        }

        private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // GET api/members
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberResponseDTO>>> GetAll()
        {
            return Ok(await _memberRepo.GetAllAsync());
        }

        // GET api/members/roles
        [HttpGet("roles")]
        public async Task<ActionResult<IEnumerable<PersonRole>>> GetPersonRoles()
        {
            var roles = await _memberRepo.GetPersonRolesAsync();
            return Ok(roles);
        }

        // GET api/members/JBF-001
        [HttpGet("{id}")]
        public async Task<ActionResult<MemberResponseDTO>> GetById(string id)
        {
            var member = await _memberRepo.GetByIdAsync(id);
            return member == null ? NotFound(new { message = $"Member '{id}' not found." }) : Ok(member);
        }

        // POST api/members
        [HttpPost]
        public async Task<ActionResult<MemberResponseDTO>> Create([FromBody] MemberDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NIDNumber) && string.IsNullOrWhiteSpace(dto.BirthCertificateNo))
            {
                return BadRequest(new { message = "A member must provide either an NID Number or a Birth Certificate Number." });
            }

            try
            {
                var created = await _memberRepo.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.MemberID }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to register member.", error = ex.Message });
            }
        }

        // POST api/members/upload-image
        [HttpPost("upload-image")]
        [RequestSizeLimit(10_000_000)] // 10 MB limit
        public async Task<ActionResult> UploadImage(IFormFile? file)
        {
            file ??= Request.Form.Files.FirstOrDefault();

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No image file provided." });

            try
            {
                var imageUrl = await _imageService.SaveImageAsync(file, "members");
                return Ok(new { imageUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT api/members/JBF-001
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] MemberDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NIDNumber) && string.IsNullOrWhiteSpace(dto.BirthCertificateNo))
            {
                return BadRequest(new { message = "A member must provide either an NID Number or a Birth Certificate Number." });
            }

            try
            {
                var updated = await _memberRepo.UpdateAsync(id, dto);
                return updated ? NoContent() : NotFound(new { message = $"Member '{id}' not found." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update member profile.", error = ex.Message });
            }
        }

        // DELETE api/members/JBF-001
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _memberRepo.DeleteAsync(id);
            return deleted ? NoContent() : NotFound(new { message = $"Member '{id}' not found." });
        }

        // POST api/members/request-membership
        // Seeker / BloodDonor / FundDonor submits a membership request.
        // Does NOT save to dbo.Members — sends notification to Admin only.
        [HttpPost("request-membership")]
        public async Task<IActionResult> RequestMembership([FromBody] MemberRequestDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Encode all data into the notification message so Admin can read and act on it
            var payload = JsonSerializer.Serialize(dto);
            var message = $"Name: {dto.Name} | Contact: {dto.ContactNumber} | Email: {dto.Email ?? "N/A"} | __payload__:{payload}";

            await _notifications.NotifyRolesAsync(
                roles: new[] { AppRoles.Admin },
                excludeUserId: CurrentUserId,
                title: $"New Member Request from {dto.Name}",
                message: message,
                type: NotificationTypes.MemberRequest
            );

            return Ok(new { flag = true, message = "We have received your request. We will reach you soon!" });
        }

        // POST api/members/approve-request
        [HttpPost("approve-request")]
        [Authorize(Roles = AppRoles.Admin)]
        public async Task<IActionResult> ApproveRequest([FromBody] MemberDTO dto)
        {
            try
            {
                // 1. Ensure required names exist
                if (string.IsNullOrWhiteSpace(dto.FirstName))
                    dto.FirstName = "Member";
                if (string.IsNullOrWhiteSpace(dto.LastName))
                    dto.LastName = "Applicant";

                // 2. Ensure ContactNumber exists
                if (string.IsNullOrWhiteSpace(dto.ContactNumber))
                    dto.ContactNumber = "01700000000";

                // 3. Ensure NID or BirthCert exists to satisfy database validation
                if (string.IsNullOrWhiteSpace(dto.NIDNumber) && string.IsNullOrWhiteSpace(dto.BirthCertificateNo))
                {
                    dto.NIDNumber = "REQ" + DateTime.UtcNow.Ticks.ToString()[^10..]; // Unique 13-digit placeholder NID
                }

                // 4. Ensure default location fields
                if (string.IsNullOrWhiteSpace(dto.District)) dto.District = "Dhaka";
                if (string.IsNullOrWhiteSpace(dto.City)) dto.City = "Dhaka";
                if (string.IsNullOrWhiteSpace(dto.Area)) dto.Area = "Headquarters";

                // 5. Ensure valid PersonRoleId
                if (!dto.PersonRoleId.HasValue || dto.PersonRoleId.Value <= 0)
                {
                    var roles = await _memberRepo.GetPersonRolesAsync();
                    var memberRole = roles.FirstOrDefault(r => !r.PersonRoleName.Contains("Donor", StringComparison.OrdinalIgnoreCase))
                                  ?? roles.FirstOrDefault();
                    if (memberRole != null)
                    {
                        dto.PersonRoleId = memberRole.PersonRoleId;
                    }
                }

                var created = await _memberRepo.CreateAsync(dto);
                return Ok(new { flag = true, message = "Member approved and added to the database successfully.", memberId = created.MemberID });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to approve member.", error = ex.Message });
            }
        }
    }
}
