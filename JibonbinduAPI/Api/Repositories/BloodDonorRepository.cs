using Api.Data;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;
using SharedLibrary.Models;
using System.Linq.Expressions;

namespace Api.Repositories
{
    public class BloodDonorRepository : IBloodDonorRepository
    {
        private readonly JBFIdentityDbContext _context;

        public BloodDonorRepository(JBFIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BloodDonorResponse>> SearchAsync(string? bloodGroup, string? district, string? area, bool availableOnly, DonationType donationType = DonationType.WholeBlood)
        {
            return await _context.QueryProcAsync<BloodDonorResponse>($@"EXEC dbo.usp_BloodDonor_Search
                @BloodGroup = {bloodGroup},
                @District = {district},
                @Area = {area},
                @AvailableOnly = {availableOnly},
                @AvailableStatus = {DonorStatusNames.Available},
                @IntervalDays = {DonationRules.GetIntervalDays(donationType)}");
        }

        public async Task<BloodDonorResponse?> GetByIdAsync(int bloodDonorId)
        {
            return await _context.QueryProcSingleAsync<BloodDonorResponse>($"EXEC dbo.usp_BloodDonor_GetById @Id = {bloodDonorId}");
        }

        public async Task<BloodDonorResponse?> GetByUserIdAsync(string userId)
        {
            return await _context.QueryProcSingleAsync<BloodDonorResponse>($"EXEC dbo.usp_BloodDonor_GetByUserId @UserId = {userId}");
        }

        public async Task<BloodDonorResponse> RegisterAsync(string userId, BloodDonorDTO dto)
        {
            var bloodGroupId = await GetBloodGroupIdAsync(dto.BloodGroup);
            var donorStatusId = await GetOrCreateDonorStatusIdAsync(dto.IsAvailable ? DonorStatusNames.Available : DonorStatusNames.Unavailable);

            // Create a new dedicated Person instance for this new donor
            var roleId = await GetOrCreatePersonRoleIdAsync(PersonRoleNames.BloodDonor);
            var person = new Person
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                DateOfBirth = dto.DateOfBirth.Date,
                ContactNumber = dto.ContactNo.Trim(),
                District = dto.District?.Trim() ?? string.Empty,
                City = dto.City?.Trim() ?? string.Empty,
                Area = dto.Area?.Trim() ?? string.Empty,
                PersonRoleId = roleId,
                ApplicationUserId = null
            };

            _context.Persons.Add(person);
            await _context.SaveChangesAsync();

            // Connect PersonId to the new BloodDonor and persist TotalDonation
            var donor = new BloodDonor
            {
                PersonId = person.PersonId,
                Person = person,
                BloodGroupId = bloodGroupId,
                LastDonationDate = dto.LastDonationDate,
                LastDonationType = dto.LastDonationType,
                DonorStatusId = donorStatusId,
                TotalDonation = dto.TotalDonation,
                PreferredLocation = dto.PreferredLocation ?? string.Empty,
                PreferredTime = dto.PreferredTime ?? string.Empty,
                Remarks = dto.Remarks ?? string.Empty
            };

            _context.BloodDonors.Add(donor);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(donor.BloodDonorId))!;
        }

        public async Task<bool> UpdateAsync(int bloodDonorId, BloodDonorDTO dto)
        {
            var donor = await _context.BloodDonors
                .Include(d => d.Person)
                .FirstOrDefaultAsync(d => d.BloodDonorId == bloodDonorId);

            if (donor is null) return false;

            ApplyPerson(donor.Person, dto);
            donor.BloodGroupId = await GetBloodGroupIdAsync(dto.BloodGroup);
            donor.LastDonationDate = dto.LastDonationDate;
            donor.LastDonationType = dto.LastDonationType;
            donor.DonorStatusId = await GetOrCreateDonorStatusIdAsync(dto.IsAvailable ? DonorStatusNames.Available : DonorStatusNames.Unavailable);
            donor.TotalDonation = dto.TotalDonation; // Updates TotalDonation
            donor.PreferredLocation = dto.PreferredLocation;
            donor.PreferredTime = dto.PreferredTime;
            donor.Remarks = dto.Remarks;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateByUserIdAsync(string userId, BloodDonorDTO dto)
        {
            var donor = await _context.BloodDonors
                .Include(d => d.Person)
                .FirstOrDefaultAsync(d => d.Person.ApplicationUserId == userId);

            if (donor is null) return false;

            ApplyPerson(donor.Person, dto);
            donor.BloodGroupId = await GetBloodGroupIdAsync(dto.BloodGroup);
            donor.LastDonationDate = dto.LastDonationDate;
            donor.LastDonationType = dto.LastDonationType;
            donor.DonorStatusId = await GetOrCreateDonorStatusIdAsync(dto.IsAvailable ? DonorStatusNames.Available : DonorStatusNames.Unavailable);
            donor.TotalDonation = dto.TotalDonation;
            donor.PreferredLocation = dto.PreferredLocation;
            donor.PreferredTime = dto.PreferredTime;
            donor.Remarks = dto.Remarks;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStatusAsync(int bloodDonorId, string statusName)
        {
            var donor = await _context.BloodDonors.FindAsync(bloodDonorId);
            if (donor is null) return false;

            donor.DonorStatusId = await GetOrCreateDonorStatusIdAsync(statusName);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<DeleteResult> DeleteAsync(int bloodDonorId)
        {
            var result = await _context.ScalarIntProcAsync($"EXEC dbo.usp_BloodDonor_Delete @Id = {bloodDonorId}");
            return result switch
            {
                > 0 => DeleteResult.Deleted,
                0 => DeleteResult.NotFound,
                _ => DeleteResult.InUse
            };
        }

        // ---- helpers ----------------------------------------------------------------

        private static void ApplyPerson(Person person, BloodDonorDTO dto)
        {
            person.FirstName = dto.FirstName.Trim();
            person.LastName = dto.LastName.Trim();
            person.DateOfBirth = dto.DateOfBirth.Date;
            person.ContactNumber = dto.ContactNo.Trim();
            person.District = dto.District.Trim();
            person.City = dto.City.Trim();
            person.Area = dto.Area.Trim();
        }

        private async Task<int> GetBloodGroupIdAsync(string groupName)
        {
            var id = await _context.BloodGroups
                .Where(b => b.GroupName == groupName)
                .Select(b => (int?)b.BloodGroupId)
                .FirstOrDefaultAsync();

            return id ?? throw new InvalidOperationException($"Blood group '{groupName}' is not seeded in the database.");
        }

        private async Task<int> GetOrCreateDonorStatusIdAsync(string name)
        {
            var status = await _context.DonorStatuses.FirstOrDefaultAsync(s => s.StatusName == name);
            if (status is null)
            {
                status = new DonorStatus { StatusName = name };
                _context.DonorStatuses.Add(status);
                await _context.SaveChangesAsync();
            }
            return status.DonorStatusId;
        }

        private async Task<int> GetOrCreatePersonRoleIdAsync(string name)
        {
            var role = await _context.PersonRoles.FirstOrDefaultAsync(r => r.PersonRoleName == name);
            if (role is null)
            {
                role = new PersonRole { PersonRoleName = name };
                _context.PersonRoles.Add(role);
                await _context.SaveChangesAsync();
            }
            return role.PersonRoleId;
        }
    }
}