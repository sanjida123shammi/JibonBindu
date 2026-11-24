using SharedLibrary.DTOs;

namespace Api.Repositories
{
    /// <summary>
    /// A fund costing is stored in the DailyCost table.
    /// Reads, settlement-status change and delete use stored procedures. Create and Update use EF Core.
    /// </summary>
    public interface IFundCostingRepository
    {
        // stored procedures
        Task<IEnumerable<FundCostingResponse>> SearchAsync(FundCostingFilter filter);
        Task<FundCostingResponse?> GetByIdAsync(int id);
        Task<StatusUpdateResult> UpdateSettlementStatusAsync(int id, int settlementStatusId);
        Task<bool> DeleteAsync(int id);

        // EF Core
        Task<string?> ValidateReferencesAsync(FundCostingDTO dto);
        Task<FundCostingResponse> AddAsync(FundCostingDTO dto);
        Task<FundCostingResponse?> UpdateAsync(int id, FundCostingDTO dto);
    }
}
