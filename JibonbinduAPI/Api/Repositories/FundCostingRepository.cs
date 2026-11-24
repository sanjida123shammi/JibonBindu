using Api.Data;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.DTOs;
using SharedLibrary.Models;

namespace Api.Repositories
{
    public class FundCostingRepository : IFundCostingRepository
    {
        private readonly JBFIdentityDbContext _context;

        public FundCostingRepository(JBFIdentityDbContext context)
        {
            _context = context;
        }

        // ---------------------------- stored procedures ----------------------------

        public async Task<IEnumerable<FundCostingResponse>> SearchAsync(FundCostingFilter filter)
        {
            var page = Math.Max(filter.Page, 1);
            var pageSize = Math.Clamp(filter.PageSize, 1, 200);

            return await _context.QueryProcAsync<FundCostingResponse>($@"EXEC dbo.usp_FundCosting_Search
                @FromDate = {filter.From},
                @ToDate = {filter.To},
                @SpentByPersonId = {filter.SpentByPersonId},
                @SettlementStatusId = {filter.SettlementStatusId},
                @Page = {page},
                @PageSize = {pageSize}");
        }

        public async Task<FundCostingResponse?> GetByIdAsync(int id)
        {
            return await _context.QueryProcSingleAsync<FundCostingResponse>($"EXEC dbo.usp_FundCosting_GetById @Id = {id}");
        }

        public async Task<StatusUpdateResult> UpdateSettlementStatusAsync(int id, int settlementStatusId)
        {
            var result = await _context.ScalarIntProcAsync(
                $"EXEC dbo.usp_FundCosting_UpdateSettlementStatus @Id = {id}, @SettlementStatusId = {settlementStatusId}");

            return result switch
            {
                > 0 => StatusUpdateResult.Updated,
                0 => StatusUpdateResult.NotFound,
                _ => StatusUpdateResult.InvalidStatus
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var rows = await _context.ScalarIntProcAsync($"EXEC dbo.usp_FundCosting_Delete @Id = {id}");
            return rows > 0;
        }

        // ------------------------------- EF Core -----------------------------------

        public async Task<string?> ValidateReferencesAsync(FundCostingDTO dto)
        {
            if (!await _context.Persons.AnyAsync(x => x.PersonId == dto.SpentByPersonId))
                return "The selected person (spent by) does not exist.";
            if (!await _context.SettlementStatuses.AnyAsync(x => x.SettlementStatusId == dto.SettlementStatusId))
                return "The selected settlement status does not exist.";
            return null;
        }

        public async Task<FundCostingResponse> AddAsync(FundCostingDTO dto)
        {
            var entity = new DailyCost();
            Apply(entity, dto);

            _context.DailyCosts.Add(entity);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(entity.DailyCostId))!;
        }

        public async Task<FundCostingResponse?> UpdateAsync(int id, FundCostingDTO dto)
        {
            var entity = await _context.DailyCosts.FindAsync(id);
            if (entity is null) return null;

            Apply(entity, dto);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        private static void Apply(DailyCost entity, FundCostingDTO dto)
        {
            entity.CostingDate = dto.CostingDate.Date;
            entity.SpentByPersonId = dto.SpentByPersonId;
            entity.CostAmount = dto.CostAmount;
            entity.Purpose = dto.Purpose.Trim();
            entity.SettlementStatusId = dto.SettlementStatusId;
            entity.Remarks = dto.Remarks?.Trim() ?? string.Empty;
        }
    }
}
