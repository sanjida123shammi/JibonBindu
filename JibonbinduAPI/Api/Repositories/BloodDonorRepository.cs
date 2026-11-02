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

        //private static readonly Expression<Func<BloodDonor, BloodDonorResponse>> ToResponse = d => new BloodDonorResponse
        //{
        //    BloodDonorId = d.BloodDonorId,
        //    PersonId = d.PersonId,
        //    FullName = d.Person.FirstName + " " + d.Person.LastName,
        //    ContactNo = d.Person.ContactNumber,
        //    District = d.Person.District,
        //    City = d.Person.City,
        //    Area = d.Person.Area,
        //    BloodGroup = d.BloodGroup.GroupName,
        //    LastDonationDate = d.LastDonationDate,
        //    Status = d.DonorStatus.StatusName,
        //    TotalDonation = d.TotalDonation,
        //    PreferredLocation = d.PreferredLocation,
        //    PreferredTime = d.PreferredTime,
        //    Remarks = d.Remarks
        //};

        public async Task<IEnumerable<BloodDonorResponse>> SearchAsync(string? bloodGroup, string? district, string? area, bool availableOnly, DonationType donationType = DonationType.WholeBlood)
        {
            //var query = _context.BloodDonors.AsNoTracking();

            //if (!string.IsNullOrWhiteSpace(bloodGroup))
            //    query = query.Where(d => d.BloodGroup.GroupName == bloodGroup);

            //if (!string.IsNullOrWhiteSpace(district))
            //    query = query.Where(d => d.Person.District == district);

            //if (!string.IsNullOrWhiteSpace(area))
            //    query = query.Where(d => d.Person.Area == area);

            //if (availableOnly) {
            //    int intervalDays = DonationRules.GetIntervalDays(donationType);
            //    var cutoff = DateTime.Today.AddDays(-intervalDays);
            //    query = query.Where(d =>
            //        d.DonorStatus.StatusName == DonorStatusNames.Available &&
            //        (d.LastDonationDate == null || d.LastDonationDate <= cutoff));
            //}

            //return await query
            //    .OrderBy(d => d.Person.District)
            //    .ThenBy(d => d.Person.Area)
            //    .ThenBy(d => d.Person.FirstName)
            //    .Select(ToResponse)
            //    .ToListAsync();

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
            //return await _context.BloodDonors
            //    .AsNoTracking()
            //    .Where(d => d.BloodDonorId == bloodDonorId)
            //    .Select(ToResponse)
            //    .FirstOrDefaultAsync();

            return await _context.QueryProcSingleAsync<BloodDonorResponse>($"EXEC dbo.usp_BloodDonor_GetById @Id = {bloodDonorId}");
        }

        public async Task<BloodDonorResponse?> GetByUserIdAsync(string userId)
        {
            //return await _context.BloodDonors
            //    .AsNoTracking()
            //    .Where(d => d.Person.ApplicationUserId == userId)
            //    .Select(ToResponse)
            //    .FirstOrDefaultAsync();

            return await _context.QueryProcSingleAsync<BloodDonorResponse>($"EXEC dbo.usp_BloodDonor_GetByUserId @UserId = {userId}");
        }

        public async Task<BloodDonorResponse> RegisterAsync(string userId, BloodDonorDTO dto)
        {
            var bloodGroupId = await GetBloodGroupIdAsync(dto.BloodGroup);
            var donorStatusId = await GetOrCreateDonorStatusIdAsync(dto.IsAvailable ? DonorStatusNames.Available : DonorStatusNames.Unavailable);

            // The user may already have a Person row (e.g. as a fund donor) - reuse it.
            var person = await _context.Persons.FirstOrDefaultAsync(p => p.ApplicationUserId == userId);
            if (person is null)
            {
                person = new Person
                {
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    ContactNumber = dto.ContactNo,
                    ApplicationUserId = userId,
                    PersonRoleId = await GetOrCreatePersonRoleIdAsync(PersonRoleNames.BloodDonor)
                };
                _context.Persons.Add(person);
            }
            ApplyPerson(person, dto);

            var donor = new BloodDonor
            {
                Person = person,
                BloodGroupId = bloodGroupId,
                LastDonationDate = dto.LastDonationDate,
                LastDonationType = dto.LastDonationType,
                DonorStatusId = donorStatusId,
                TotalDonation = 0,
                PreferredLocation = dto.PreferredLocation,
                PreferredTime = dto.PreferredTime,
                Remarks = dto.Remarks
            };

            _context.BloodDonors.Add(donor);
            await _context.SaveChangesAsync(); // Person + BloodDonor are saved in one transaction

            return (await GetByIdAsync(donor.BloodDonorId))!;
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
            donor.DonorStatusId = await GetOrCreateDonorStatusIdAsync(dto.IsAvailable ? DonorStatusNames.Available : DonorStatusNames.Unavailable);
            donor.PreferredLocation = dto.PreferredLocation;
            donor.PreferredTime = dto.PreferredTime;
            donor.Remarks = dto.Remarks;

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
            person.FirstName = dto.FirstName;
            person.LastName = dto.LastName;
            person.DateOfBirth = dto.DateOfBirth.Date;
            person.ContactNumber = dto.ContactNo;
            person.District = dto.District;
            person.City = dto.City;
            person.Area = dto.Area;
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
