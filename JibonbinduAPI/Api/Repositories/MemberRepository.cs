using Api.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;
using SharedLibrary.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Repositories
{
    public class MemberRepository : IMemberRepository
    {
        private readonly JBFIdentityDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public MemberRepository(JBFIdentityDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IEnumerable<MemberResponseDTO>> GetAllAsync()
        {
            return await _context.Members
                .Include(m => m.Person)
                .Include(m => m.PersonRole)
                .OrderBy(m => m.MemberID)
                .Select(m => new MemberResponseDTO
                {
                    MemberID = m.MemberID,
                    PersonId = m.PersonId,
                    FullName = m.Person.FirstName + " " + m.Person.LastName,
                    FirstName = m.Person.FirstName,
                    LastName = m.Person.LastName,
                    DateOfBirth = m.Person.DateOfBirth,
                    ContactNumber = m.Person.ContactNumber,
                    District = m.Person.District,
                    City = m.Person.City,
                    Area = m.Person.Area,
                    NIDNumber = m.NIDNumber,
                    BirthCertificateNo = m.BirthCertificateNo,
                    ImageUrl = m.ImageUrl ?? m.Person.ImageUrl,
                    PersonRoleID = m.PersonRoleID,
                    RoleName = m.PersonRole.PersonRoleName
                })
                .ToListAsync();
        }

        public async Task<MemberResponseDTO?> GetByIdAsync(string memberId)
        {
            return await _context.Members
                .Include(m => m.Person)
                .Include(m => m.PersonRole)
                .Where(m => m.MemberID == memberId)
                .Select(m => new MemberResponseDTO
                {
                    MemberID = m.MemberID,
                    PersonId = m.PersonId,
                    FullName = m.Person.FirstName + " " + m.Person.LastName,
                    FirstName = m.Person.FirstName,
                    LastName = m.Person.LastName,
                    DateOfBirth = m.Person.DateOfBirth,
                    ContactNumber = m.Person.ContactNumber,
                    District = m.Person.District,
                    City = m.Person.City,
                    Area = m.Person.Area,
                    NIDNumber = m.NIDNumber,
                    BirthCertificateNo = m.BirthCertificateNo,
                    ImageUrl = m.ImageUrl ?? m.Person.ImageUrl,
                    PersonRoleID = m.PersonRoleID,
                    RoleName = m.PersonRole.PersonRoleName
                })
                .FirstOrDefaultAsync();
        }

        public async Task<MemberResponseDTO> CreateAsync(MemberDTO dto)
        {
            var nid = dto.NIDNumber?.Trim();
            var birthCert = dto.BirthCertificateNo?.Trim();

            if (string.IsNullOrWhiteSpace(nid) && string.IsNullOrWhiteSpace(birthCert))
            {
                throw new ArgumentException("A member must provide either an NID Number or a Birth Certificate Number.");
            }

            // 1. By default, members are assigned to "Member" role
            var roleId = await GetOrCreatePersonRoleIdAsync("Member");

            // 2. Check if member's email matches any registered AspNetUsers account
            string? matchedUserId = null;
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var user = await _userManager.FindByEmailAsync(dto.Email.Trim());
                if (user != null)
                {
                    matchedUserId = user.Id;

                    // Ensure user has both "User" and "Member" roles in Identity
                    if (!await _userManager.IsInRoleAsync(user, AppRoles.Member))
                    {
                        await _userManager.AddToRoleAsync(user, AppRoles.Member);
                    }
                    if (!await _userManager.IsInRoleAsync(user, AppRoles.User))
                    {
                        await _userManager.AddToRoleAsync(user, AppRoles.User);
                    }
                }
            }

            // 3. Create Person instance linked to ApplicationUserId if matched
            var person = new Person
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                DateOfBirth = dto.DateOfBirth.Date,
                ContactNumber = dto.ContactNumber.Trim(),
                District = dto.District?.Trim() ?? string.Empty,
                City = dto.City?.Trim() ?? string.Empty,
                Area = dto.Area?.Trim() ?? string.Empty,
                ImageUrl = dto.ImageUrl,
                PersonRoleId = roleId,
                ApplicationUserId = matchedUserId
            };

            _context.Persons.Add(person);
            await _context.SaveChangesAsync(); // Generates person.PersonId

            // 4. Generate sequential MemberID (JBF-00#)
            var memberId = await GenerateNextMemberIdAsync();

            // 5. Connect PersonId with Member
            var member = new Member
            {
                MemberID = memberId,
                PersonId = person.PersonId,
                NIDNumber = string.IsNullOrWhiteSpace(nid) ? null : nid,
                BirthCertificateNo = string.IsNullOrWhiteSpace(birthCert) ? null : birthCert,
                ImageUrl = dto.ImageUrl,
                PersonRoleID = roleId
            };

            _context.Members.Add(member);
            await _context.SaveChangesAsync();

            // 6. Ensure member role entry exists in dbo.MemberRoles
            var memberRoleObj = await _context.Roles.FirstOrDefaultAsync(r => r.Name == AppRoles.Member);
            if (memberRoleObj != null)
            {
                await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"IF NOT EXISTS (SELECT 1 FROM dbo.MemberRoles WHERE MemberID = {memberId} AND RoleId = {memberRoleObj.Id}) INSERT INTO dbo.MemberRoles (MemberID, RoleId, AssignedAt) VALUES ({memberId}, {memberRoleObj.Id}, {DateTime.UtcNow})");
            }

            return (await GetByIdAsync(member.MemberID))!;
        }

        public async Task<bool> UpdateAsync(string memberId, MemberDTO dto)
        {
            var nid = dto.NIDNumber?.Trim();
            var birthCert = dto.BirthCertificateNo?.Trim();

            if (string.IsNullOrWhiteSpace(nid) && string.IsNullOrWhiteSpace(birthCert))
            {
                throw new ArgumentException("A member must provide either an NID Number or a Birth Certificate Number.");
            }

            var member = await _context.Members
                .Include(m => m.Person)
                .FirstOrDefaultAsync(m => m.MemberID == memberId);

            if (member == null) return false;

            // Resolve role if provided
            if (dto.PersonRoleId.HasValue && await _context.PersonRoles.AnyAsync(r => r.PersonRoleId == dto.PersonRoleId.Value))
            {
                member.PersonRoleID = dto.PersonRoleId.Value;
                member.Person.PersonRoleId = dto.PersonRoleId.Value;
            }

            // Update Person data
            member.Person.FirstName = dto.FirstName.Trim();
            member.Person.LastName = dto.LastName.Trim();
            member.Person.DateOfBirth = dto.DateOfBirth.Date;
            member.Person.ContactNumber = dto.ContactNumber.Trim();
            member.Person.District = dto.District?.Trim() ?? string.Empty;
            member.Person.City = dto.City?.Trim() ?? string.Empty;
            member.Person.Area = dto.Area?.Trim() ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
            {
                member.Person.ImageUrl = dto.ImageUrl;
                member.ImageUrl = dto.ImageUrl;
            }

            // Update Member data
            member.NIDNumber = string.IsNullOrWhiteSpace(nid) ? null : nid;
            member.BirthCertificateNo = string.IsNullOrWhiteSpace(birthCert) ? null : birthCert;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string memberId)
        {
            var member = await _context.Members
                .Include(m => m.Person)
                .FirstOrDefaultAsync(m => m.MemberID == memberId);

            if (member == null) return false;

            _context.Members.Remove(member);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<PersonRole>> GetPersonRolesAsync()
        {
            // Ensure essential roles exist in dbo.PersonRoles
            await GetOrCreatePersonRoleIdAsync("General Member");
            await GetOrCreatePersonRoleIdAsync("Executive Member");
            await GetOrCreatePersonRoleIdAsync("Volunteer Coordinator");

            return await _context.PersonRoles.OrderBy(r => r.PersonRoleId).ToListAsync();
        }

        // Generates sequential IDs: JBF-001, JBF-002, JBF-003, etc.
        private async Task<string> GenerateNextMemberIdAsync()
        {
            var existingIds = await _context.Members
                .Select(m => m.MemberID)
                .ToListAsync();

            int maxNumber = 0;
            foreach (var id in existingIds)
            {
                if (id != null && id.StartsWith("JBF-", StringComparison.OrdinalIgnoreCase))
                {
                    var numPart = id.Substring(4);
                    if (int.TryParse(numPart, out var num) && num > maxNumber)
                    {
                        maxNumber = num;
                    }
                }
            }

            int next = maxNumber + 1;
            return $"JBF-{next:D3}";
        }

        private async Task<int> GetOrCreatePersonRoleIdAsync(string roleName)
        {
            var role = await _context.PersonRoles.FirstOrDefaultAsync(r => r.PersonRoleName == roleName);
            if (role == null)
            {
                role = new PersonRole { PersonRoleName = roleName };
                _context.PersonRoles.Add(role);
                await _context.SaveChangesAsync();
            }
            return role.PersonRoleId;
        }
    }
}