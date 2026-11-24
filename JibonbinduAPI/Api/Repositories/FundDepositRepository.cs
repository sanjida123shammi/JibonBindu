using Api.Data;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.DTOs;
using SharedLibrary.Models;

namespace Api.Repositories
{
    public class FundDepositRepository : IFundDepositRepository
    {
        private readonly JBFIdentityDbContext _context;

        public FundDepositRepository(JBFIdentityDbContext context)
        {
            _context = context;
        }

        // ---------------------------- stored procedures ----------------------------

        public async Task<IEnumerable<FundDepositResponse>> SearchAsync(FundDepositFilter filter)
        {
            var page = Math.Max(filter.Page, 1);
            var pageSize = Math.Clamp(filter.PageSize, 1, 200);

            return await _context.QueryProcAsync<FundDepositResponse>($@"EXEC dbo.usp_FundDeposit_Search
                @FromDate = {filter.From},
                @ToDate = {filter.To},
                @FundDonorId = {filter.FundDonorId},
                @FundDonorTypeId = {filter.FundDonorTypeId},
                @FundingTypeId = {filter.FundingTypeId},
                @CashTypeId = {filter.CashTypeId},
                @Page = {page},
                @PageSize = {pageSize}");
        }

        public async Task<FundDepositResponse?> GetByIdAsync(int id)
        {
            return await _context.QueryProcSingleAsync<FundDepositResponse>($"EXEC dbo.usp_FundDeposit_GetById @Id = {id}");
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var rows = await _context.ScalarIntProcAsync($"EXEC dbo.usp_FundDeposit_Delete @Id = {id}");
            return rows > 0;
        }

        // ------------------------------- EF Core -----------------------------------

        public async Task<string?> ValidateReferencesAsync(FundDepositDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.DonorName) && (!dto.FundDonorId.HasValue || dto.FundDonorId <= 0))
                return "Please provide a donor name.";

            if (dto.FundDonorTypeId.HasValue && dto.FundDonorTypeId.Value > 0)
            {
                if (!await _context.FundDonorTypes.AnyAsync(x => x.FundDonorTypeId == dto.FundDonorTypeId.Value))
                    return "The selected fund donor type does not exist.";
            }

            if (!await _context.FundingTypes.AnyAsync(x => x.FundingTypeId == dto.FundingTypeId))
                return "The selected funding type does not exist.";

            if (!await _context.CashTypes.AnyAsync(x => x.CashTypeId == dto.CashTypeId))
                return "The selected cash type does not exist.";

            return null;
        }

        public async Task<FundDepositResponse> AddAsync(FundDepositDTO dto)
        {
            var donorId = await EnsureFundDonorAsync(dto);
            dto.FundDonorId = donorId;

            var entity = new FundDeposit();
            Apply(entity, dto);

            _context.FundDeposits.Add(entity);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(entity.FundDepositId))!;
        }

        public async Task<FundDepositResponse?> UpdateAsync(int id, FundDepositDTO dto)
        {
            var entity = await _context.FundDeposits.FindAsync(id);
            if (entity is null) return null;

            var donorId = await EnsureFundDonorAsync(dto);
            dto.FundDonorId = donorId;

            Apply(entity, dto);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        private async Task<int> EnsureFundDonorAsync(FundDepositDTO dto)
        {
            // 1. If FundDonorId was provided and exists, update its details
            if (dto.FundDonorId.HasValue && dto.FundDonorId.Value > 0)
            {
                var existing = await _context.FundDonors
                    .Include(fd => fd.Person)
                    .FirstOrDefaultAsync(fd => fd.FundDonorId == dto.FundDonorId.Value);

                if (existing != null)
                {
                    if (dto.FundDonorTypeId.HasValue && dto.FundDonorTypeId.Value > 0)
                        existing.FundDonorTypeId = dto.FundDonorTypeId.Value;

                    if (!string.IsNullOrWhiteSpace(dto.DonorName))
                    {
                        var parts = dto.DonorName.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                        existing.Person.FirstName = parts.Length > 0 ? parts[0] : existing.Person.FirstName;
                        existing.Person.LastName = parts.Length > 1 ? parts[1] : string.Empty;
                    }
                    if (!string.IsNullOrWhiteSpace(dto.DonorContactNo))
                    {
                        existing.Person.ContactNumber = dto.DonorContactNo.Trim();
                    }
                    await _context.SaveChangesAsync();
                    return existing.FundDonorId;
                }
            }

            // 2. Look for existing donor by matching Person full name or contact number
            var donorName = (dto.DonorName ?? string.Empty).Trim();
            var contact = (dto.DonorContactNo ?? string.Empty).Trim();

            var matched = await _context.FundDonors
                .Include(fd => fd.Person)
                .FirstOrDefaultAsync(fd =>
                    (!string.IsNullOrEmpty(donorName) && (fd.Person.FirstName + " " + fd.Person.LastName).Trim().ToLower() == donorName.ToLower())
                    || (!string.IsNullOrEmpty(contact) && fd.Person.ContactNumber == contact));

            if (matched != null)
            {
                if (dto.FundDonorTypeId.HasValue && dto.FundDonorTypeId.Value > 0)
                {
                    matched.FundDonorTypeId = dto.FundDonorTypeId.Value;
                    await _context.SaveChangesAsync();
                }
                return matched.FundDonorId;
            }

            // 3. Create new Person and FundDonor
            var nameParts = donorName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
            var firstName = nameParts.Length > 0 ? nameParts[0] : "Donor";
            var lastName = nameParts.Length > 1 ? nameParts[1] : string.Empty;

            var role = await _context.PersonRoles.FirstOrDefaultAsync(r => r.PersonRoleName == "FundDonor" || r.PersonRoleName == "Donor")
                       ?? await _context.PersonRoles.FirstOrDefaultAsync();
            var roleId = role?.PersonRoleId ?? 1;

            var person = new Person
            {
                FirstName = firstName,
                LastName = lastName,
                ContactNumber = string.IsNullOrWhiteSpace(contact) ? "01700000000" : contact,
                PersonRoleId = roleId,
                DateOfBirth = new DateTime(2000, 1, 1),
                District = "Dhaka",
                City = "Dhaka",
                Area = "Uttara"
            };
            _context.Persons.Add(person);
            await _context.SaveChangesAsync();

            var donorTypeId = (dto.FundDonorTypeId.HasValue && dto.FundDonorTypeId.Value > 0)
                ? dto.FundDonorTypeId.Value
                : (await _context.FundDonorTypes.Select(t => t.FundDonorTypeId).FirstOrDefaultAsync());

            var fundDonor = new FundDonor
            {
                PersonId = person.PersonId,
                FundDonorTypeId = donorTypeId,
                DonationSlot = "General",
                PayAmount = dto.Amount
            };
            _context.FundDonors.Add(fundDonor);
            await _context.SaveChangesAsync();

            return fundDonor.FundDonorId;
        }

        private static void Apply(FundDeposit entity, FundDepositDTO dto)
        {
            entity.FundDonationDate = dto.FundDonationDate.Date;
            entity.FundDonorId = dto.FundDonorId ?? 1;
            entity.Amount = dto.Amount;
            entity.FundReceiver = string.IsNullOrWhiteSpace(dto.FundReceiver) ? null : dto.FundReceiver.Trim();
            entity.FundingTypeId = dto.FundingTypeId;
            entity.CashTypeId = dto.CashTypeId;
            entity.Months = dto.Months?.Trim() ?? string.Empty;
        }
    }
}