using Api.Data;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;
using SharedLibrary.Models;

namespace Api.Repositories
{
    public class FundLookupRepository : IFundLookupRepository
    {
        private readonly JBFIdentityDbContext _context;

        public FundLookupRepository(JBFIdentityDbContext context)
        {
            _context = context;
        }

        // ---------------------------- stored procedures ----------------------------

        public async Task<FundLookupsResponse> GetAllAsync()
        {
            var rows = await _context.QueryProcAsync<FundLookupRow>($"EXEC dbo.usp_FundLookup_GetAll");

            List<LookupItem> Pick(string kind) => rows
                .Where(r => r.Kind == kind)
                .Select(r => new LookupItem { Id = r.Id, Name = r.Name })
                .ToList();

            return new FundLookupsResponse
            {
                FundingTypes = Pick(FundLookupKinds.FundingTypes),
                CashTypes = Pick(FundLookupKinds.CashTypes),
                DonorTypes = Pick(FundLookupKinds.DonorTypes),
                SettlementStatuses = Pick(FundLookupKinds.SettlementStatuses)
            };
        }

        public async Task<IEnumerable<FundDonorOption>> GetFundDonorOptionsAsync(string? search, int take = 100)
        {
            take = Math.Clamp(take, 1, 500);
            search = string.IsNullOrWhiteSpace(search) ? null : search.Trim();

            return await _context.QueryProcAsync<FundDonorOption>(
                $"EXEC dbo.usp_FundDonor_GetOptions @Search = {search}, @Take = {take}");
        }

        public async Task<IEnumerable<PersonOption>> GetPersonOptionsAsync(string? search, int take = 50)
        {
            take = Math.Clamp(take, 1, 500);
            search = string.IsNullOrWhiteSpace(search) ? null : search.Trim();

            return await _context.QueryProcAsync<PersonOption>(
                $"EXEC dbo.usp_Person_GetOptions @Search = {search}, @Take = {take}");
        }

        // ------------------------------- EF Core -----------------------------------

        public async Task<LookupItem?> AddAsync(string kind, string name)
        {
            name = name.Trim();

            // The database collation is case-insensitive, so "cash" and "Cash" count as the same name.
            switch (kind)
            {
                case FundLookupKinds.FundingTypes:
                {
                    if (await _context.FundingTypes.AnyAsync(x => x.FundingTypeName == name)) return null;
                    var entity = new FundingType { FundingTypeName = name };
                    _context.FundingTypes.Add(entity);
                    await _context.SaveChangesAsync();
                    return new LookupItem { Id = entity.FundingTypeId, Name = entity.FundingTypeName };
                }
                case FundLookupKinds.CashTypes:
                {
                    if (await _context.CashTypes.AnyAsync(x => x.CashTypeName == name)) return null;
                    var entity = new CashType { CashTypeName = name };
                    _context.CashTypes.Add(entity);
                    await _context.SaveChangesAsync();
                    return new LookupItem { Id = entity.CashTypeId, Name = entity.CashTypeName };
                }
                case FundLookupKinds.DonorTypes:
                {
                    if (await _context.FundDonorTypes.AnyAsync(x => x.FundDonorTypeName == name)) return null;
                    var entity = new FundDonorType { FundDonorTypeName = name };
                    _context.FundDonorTypes.Add(entity);
                    await _context.SaveChangesAsync();
                    return new LookupItem { Id = entity.FundDonorTypeId, Name = entity.FundDonorTypeName };
                }
                case FundLookupKinds.SettlementStatuses:
                {
                    if (await _context.SettlementStatuses.AnyAsync(x => x.SettlementStatusTitle == name)) return null;
                    var entity = new SettlementStatus { SettlementStatusTitle = name };
                    _context.SettlementStatuses.Add(entity);
                    await _context.SaveChangesAsync();
                    return new LookupItem { Id = entity.SettlementStatusId, Name = entity.SettlementStatusTitle };
                }
                default:
                    throw new ArgumentException($"Unknown lookup kind '{kind}'.", nameof(kind));
            }
        }
    }
}
