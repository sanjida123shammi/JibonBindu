using Api.Data;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JBFIdentityDbContext _context;
        private readonly IImageService _imageService;

        public UsersController(UserManager<ApplicationUser> userManager, JBFIdentityDbContext context, IImageService imageService)
        {
            _userManager = userManager;
            _context = context;
            _imageService = imageService;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDetailDTO>>> GetAllUsers()
        {
            var users = await _userManager.Users
                .OrderBy(u => u.Email)
                .ToListAsync();

            // Map ApplicationUserId -> MemberID
            var memberLookup = await (
                from p in _context.Persons
                where p.ApplicationUserId != null
                join m in _context.Members on p.PersonId equals m.PersonId into memberJoin
                from m in memberJoin.DefaultIfEmpty()
                select new
                {
                    UserId = p.ApplicationUserId!,
                    MemberId = m != null ? m.MemberID : null
                }
            ).ToDictionaryAsync(x => x.UserId, x => x.MemberId);

            var userDtos = new List<UserDetailDTO>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new UserDetailDTO
                {
                    Id = user.Id,
                    Name = user.Name ?? user.UserName ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    PhoneNumber = user.PhoneNumber,
                    Roles = roles.ToList(),
                    MemberID = memberLookup.TryGetValue(user.Id, out var mId) ? mId : null,
                    EmailConfirmed = user.EmailConfirmed,
                    IsLockedOut = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow
                });
            }

            return Ok(userDtos);
        }

        // POST: api/users/change-password
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest(new { message = "Current password and new password are required." });

            if (dto.NewPassword != dto.ConfirmPassword)
                return BadRequest(new { message = "New password and confirm password do not match." });

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User is not logged in." });

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return BadRequest(new { message = errors });
            }

            return Ok(new { message = "Password updated successfully." });
        }

        // GET: api/users/profile
        [HttpGet("profile")]
        public async Task<ActionResult<UserProfileDTO>> GetProfile()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User is not logged in." });

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new UserProfileDTO
            {
                Id = user.Id,
                FullName = user.Name ?? user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty, // Blank by default if not set
                Location = string.IsNullOrWhiteSpace(user.Location) ? "Dhaka, Bangladesh" : user.Location,
                AvatarUrl = user.AvatarUrl ?? string.Empty,
                Role = roles.FirstOrDefault() ?? "User"
            });
        }

        // PUT: api/users/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDTO dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User is not logged in." });

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            user.Name = dto.FullName?.Trim();
            user.PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber) ? null : dto.PhoneNumber.Trim();
            user.Location = string.IsNullOrWhiteSpace(dto.Location) ? "Dhaka, Bangladesh" : dto.Location.Trim();
            if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
            {
                user.AvatarUrl = dto.AvatarUrl;
            }

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                return BadRequest(new { message = string.Join("; ", updateResult.Errors.Select(e => e.Description)) });
            }

            // Keep Person table contact number in sync if linked
            var person = await _context.Persons.FirstOrDefaultAsync(p => p.ApplicationUserId == user.Id);
            if (person != null && !string.IsNullOrWhiteSpace(user.PhoneNumber))
            {
                person.ContactNumber = user.PhoneNumber;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Profile updated successfully." });
        }

        // POST: api/users/upload-avatar (Saved strictly to wwwroot/images/users)
        [HttpPost("upload-avatar")]
        [RequestSizeLimit(10_000_000)]
        public async Task<ActionResult> UploadAvatar(IFormFile? file)
        {
            file ??= Request.Form.Files.FirstOrDefault();
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No image file provided." });

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User is not logged in." });

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            try
            {
                // subFolder = "users" ensures images save to wwwroot/images/users without affecting "members"
                var relativePath = await _imageService.SaveImageAsync(file, "users");
                user.AvatarUrl = relativePath;
                await _userManager.UpdateAsync(user);

                return Ok(new { avatarUrl = relativePath });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}