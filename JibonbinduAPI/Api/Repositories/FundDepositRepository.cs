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
                @FundDonationTypeId = {filter.FundDonationTypeId},
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
            if (!await _context.FundDonors.AnyAsync(x => x.FundDonorId == dto.FundDonorId))
                return "The selected fund donor does not exist.";
            if (!await _context.FundDonationTypes.AnyAsync(x => x.FundDonationTypeId == dto.FundDonationTypeId))
                return "The selected donation type does not exist.";
            if (!await _context.FundingTypes.AnyAsync(x => x.FundingTypeId == dto.FundingTypeId))
                return "The selected funding type does not exist.";
            if (!await _context.CashTypes.AnyAsync(x => x.CashTypeId == dto.CashTypeId))
                return "The selected cash type does not exist.";
            return null;
        }

        public async Task<FundDepositResponse> AddAsync(FundDepositDTO dto)
        {
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

            Apply(entity, dto);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        private static void Apply(FundDeposit entity, FundDepositDTO dto)
        {
            entity.FundDonationDate = dto.FundDonationDate.Date;
            entity.FundDonationTypeId = dto.FundDonationTypeId;
            entity.FundDonorId = dto.FundDonorId;
            entity.Amount = dto.Amount;
            entity.FundReceiver = string.IsNullOrWhiteSpace(dto.FundReceiver) ? null : dto.FundReceiver.Trim();
            entity.FundingTypeId = dto.FundingTypeId;
            entity.CashTypeId = dto.CashTypeId;
            entity.Months = dto.Months?.Trim() ?? string.Empty;
        }
    }
}
