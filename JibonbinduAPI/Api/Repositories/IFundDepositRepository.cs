using SharedLibrary.DTOs;

namespace Api.Repositories
{
    /// <summary>
    /// Reads and delete use stored procedures. Create and Update use EF Core.
    /// </summary>
    public interface IFundDepositRepository
    {
        // stored procedures
        Task<IEnumerable<FundDepositResponse>> SearchAsync(FundDepositFilter filter);
        Task<FundDepositResponse?> GetByIdAsync(int id);
        Task<bool> DeleteAsync(int id);

        // EF Core
        /// <summary>Returns an error message when a referenced donor / type does not exist, otherwise null.</summary>
        Task<string?> ValidateReferencesAsync(FundDepositDTO dto);
        Task<FundDepositResponse> AddAsync(FundDepositDTO dto);
        Task<FundDepositResponse?> UpdateAsync(int id, FundDepositDTO dto);
    }
}
