using SharedLibrary.DTOs;

namespace Api.Repositories
{
    /// <summary>Dropdown data for the fund screens. Reads use stored procedures, adding a value uses EF Core.</summary>
    public interface IFundLookupRepository
    {
        // stored procedures
        Task<FundLookupsResponse> GetAllAsync();
        Task<IEnumerable<FundDonorOption>> GetFundDonorOptionsAsync(string? search, int take = 100);
        Task<IEnumerable<PersonOption>> GetPersonOptionsAsync(string? search, int take = 50);

        // EF Core
        /// <summary>Adds a value to one lookup table. Returns null if the same name already exists.</summary>
        /// <param name="kind">One of SharedLibrary.Constants.FundLookupKinds.</param>
        Task<LookupItem?> AddAsync(string kind, string name);
    }
}
