using Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Constants;
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
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JBFIdentityDbContext _context;

        public RolesController(
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            JBFIdentityDbContext context)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _context = context;
        }

        // =========================================================================
        // 1. ROLES MANAGEMENT (AspNetRoles)
        // =========================================================================

        // GET: api/roles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleItemDTO>>> GetAllRoles()
        {
            var roles = await _roleManager.Roles
                .OrderBy(r => r.Name)
                .Select(r => new RoleItemDTO
                {
                    Id = r.Id,
                    Name = r.Name!
                })
                .ToListAsync();

            return Ok(roles);
        }

        // POST: api/roles
        [HttpPost]
        public async Task<ActionResult<RoleItemDTO>> CreateRole([FromBody] CreateRoleDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var cleanName = dto.Name.Trim();
            if (await _roleManager.RoleExistsAsync(cleanName))
                return BadRequest(new { message = $"Role '{cleanName}' already exists." });

            var newRole = new IdentityRole(cleanName);
            var result = await _roleManager.CreateAsync(newRole);

            if (!result.Succeeded)
                return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

            return Ok(new RoleItemDTO { Id = newRole.Id, Name = newRole.Name! });
        }

        // DELETE: api/roles/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null)
                return NotFound(new { message = "Role not found." });

            if (string.Equals(role.Name, AppRoles.Admin, StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "The 'Admin' role cannot be deleted." });

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded)
                return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

            return NoContent();
        }

        // =========================================================================
        // 2. MEMBER ROLES MANAGEMENT (dbo.MemberRoles)
        // =========================================================================

        // GET: api/roles/members (For dropdown "Select Member")
        [HttpGet("members")]
        public async Task<ActionResult<IEnumerable<MemberLookupDTO>>> GetMembers()
        {
            var list = await _context.Members
                .Include(m => m.Person)
                .OrderBy(m => m.MemberID)
                .Select(m => new MemberLookupDTO
                {
                    MemberID = m.MemberID,
                    FullName = (m.Person.FirstName + " " + m.Person.LastName).Trim(),
                    ContactNumber = m.Person.ContactNumber
                })
                .ToListAsync();

            return Ok(list);
        }

        // GET: api/roles/member-roles (List of EVERY Member with their Roles separated by comma)
        [HttpGet("member-roles")]
        public async Task<ActionResult<IEnumerable<MemberAssignedRolesDTO>>> GetMemberAssignedRoles()
        {
            // 1. Fetch EVERY member from dbo.Members with Person and PersonRole
            var members = await _context.Members
                .Include(m => m.Person)
                .Include(m => m.PersonRole)
                .OrderBy(m => m.MemberID)
                .ToListAsync();

            // 2. Fetch assigned roles from dbo.MemberRoles joined with AspNetRoles
            // (Only queries MemberID, RoleId, RoleName to match RawMemberRole 1:1)
            var memberRoleRows = await _context.Database.SqlQueryRaw<RawMemberRole>(
                @"SELECT mr.MemberID, r.Id AS RoleId, r.Name AS RoleName
                  FROM dbo.MemberRoles mr
                  JOIN dbo.AspNetRoles r ON r.Id = mr.RoleId"
            ).ToListAsync();

            var memberRoleMap = memberRoleRows
                .GroupBy(x => x.MemberID)
                .ToDictionary(g => g.Key, g => g.ToList());

            // 3. Get all AspNetRoles
            var allRoles = await _roleManager.Roles.ToListAsync();

            var result = new List<MemberAssignedRolesDTO>();

            foreach (var m in members)
            {
                var fullName = $"{m.Person.FirstName} {m.Person.LastName}".Trim();
                var roleNames = new List<string>();
                var roleIds = new List<string>();

                // Include base PersonRole (e.g. "Member") from the Member List
                if (!string.IsNullOrWhiteSpace(m.PersonRole?.PersonRoleName))
                {
                    var baseRoleName = m.PersonRole.PersonRoleName.Trim();
                    roleNames.Add(baseRoleName);

                    var matchingRole = allRoles.FirstOrDefault(r =>
                        string.Equals(r.Name, baseRoleName, StringComparison.OrdinalIgnoreCase));
                    if (matchingRole != null)
                    {
                        roleIds.Add(matchingRole.Id);
                    }
                }

                // Include any newly assigned roles from dbo.MemberRoles
                if (memberRoleMap.TryGetValue(m.MemberID, out var assignedList))
                {
                    foreach (var ar in assignedList)
                    {
                        if (!roleNames.Any(rn => string.Equals(rn, ar.RoleName, StringComparison.OrdinalIgnoreCase)))
                        {
                            roleNames.Add(ar.RoleName);
                        }
                        if (!roleIds.Contains(ar.RoleId))
                        {
                            roleIds.Add(ar.RoleId);
                        }
                    }
                }

                // Include Identity roles if person has an ApplicationUserId
                if (!string.IsNullOrWhiteSpace(m.Person.ApplicationUserId))
                {
                    var appUser = await _userManager.FindByIdAsync(m.Person.ApplicationUserId);
                    if (appUser != null)
                    {
                        var userRoles = await _userManager.GetRolesAsync(appUser);
                        foreach (var ur in userRoles)
                        {
                            if (!roleNames.Any(rn => string.Equals(rn, ur, StringComparison.OrdinalIgnoreCase)))
                            {
                                roleNames.Add(ur);
                            }
                            var rObj = allRoles.FirstOrDefault(r => string.Equals(r.Name, ur, StringComparison.OrdinalIgnoreCase));
                            if (rObj != null && !roleIds.Contains(rObj.Id))
                            {
                                roleIds.Add(rObj.Id);
                            }
                        }
                    }
                }

                result.Add(new MemberAssignedRolesDTO
                {
                    MemberID = m.MemberID,
                    MemberName = fullName,
                    ContactNumber = m.Person.ContactNumber, // Already loaded cleanly from Person!
                    RoleIds = roleIds.Distinct().ToList(),
                    RoleNames = roleNames.Distinct().ToList()
                });
            }

            return Ok(result);
        }

        // POST: api/roles/assign-member-roles
        [HttpPost("assign-member-roles")]
        public async Task<IActionResult> AssignMemberRoles([FromBody] AssignMemberRolesDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.MemberID))
                return BadRequest(new { message = "Member ID is required." });

            var member = await _context.Members
                .Include(m => m.Person)
                .FirstOrDefaultAsync(m => m.MemberID == dto.MemberID);

            if (member == null)
                return NotFound(new { message = $"Member '{dto.MemberID}' not found." });

            // 1. Delete existing assigned roles for this member
            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM dbo.MemberRoles WHERE MemberID = {dto.MemberID}");

            // 2. Insert new role assignments
            var distinctRoleIds = dto.RoleIds?.Distinct().ToList() ?? new List<string>();
            foreach (var roleId in distinctRoleIds)
            {
                var roleExists = await _roleManager.Roles.AnyAsync(r => r.Id == roleId);
                if (roleExists)
                {
                    await _context.Database.ExecuteSqlInterpolatedAsync(
                        $"INSERT INTO dbo.MemberRoles (MemberID, RoleId, AssignedAt) VALUES ({dto.MemberID}, {roleId}, {DateTime.UtcNow})");
                }
            }

            // 3. Keep AspNetUserRoles in sync if this person is linked to an ApplicationUser
            if (!string.IsNullOrWhiteSpace(member.Person.ApplicationUserId))
            {
                var appUser = await _userManager.FindByIdAsync(member.Person.ApplicationUserId);
                if (appUser != null)
                {
                    var currentRoles = await _userManager.GetRolesAsync(appUser);
                    if (currentRoles.Count > 0)
                        await _userManager.RemoveFromRolesAsync(appUser, currentRoles);

                    var newRoleNames = await _roleManager.Roles
                        .Where(r => distinctRoleIds.Contains(r.Id))
                        .Select(r => r.Name!)
                        .ToListAsync();

                    if (newRoleNames.Count > 0)
                        await _userManager.AddToRolesAsync(appUser, newRoleNames);
                }
            }

            return Ok(new { message = "Roles assigned successfully." });
        }

        // DELETE: api/roles/member-roles/{memberId}
        [HttpDelete("member-roles/{memberId}")]
        public async Task<IActionResult> DeleteMemberRoles(string memberId)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"DELETE FROM dbo.MemberRoles WHERE MemberID = {memberId}");

            return NoContent();
        }

        private class RawMemberRole
        {
            public string MemberID { get; set; } = string.Empty;
            public string RoleId { get; set; } = string.Empty;
            public string RoleName { get; set; } = string.Empty;
        }
    }
}