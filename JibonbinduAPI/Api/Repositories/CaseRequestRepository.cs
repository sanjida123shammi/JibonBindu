using Api.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;
using SharedLibrary.Models;
using System;
using System.Linq.Expressions;

namespace Api.Repositories
{
    public class CaseRequestRepository : ICaseRequestRepository
    {
        private readonly JBFIdentityDbContext _context;

        public CaseRequestRepository(JBFIdentityDbContext context)
        {
            _context = context;
        }

        // Translated to SQL by EF Core, so only the needed columns are read.
        //private static readonly Expression<Func<CaseInfo, CaseRequest>> ToDto = c => new CaseRequest
        //{
        //    Id = c.CaseInfoId,
        //    PatientProblem = c.PatientProblem,
        //    BloodGroup = c.BloodGroup.GroupName,
        //    Hemoglobin = c.Hemoglobin,
        //    BloodQuantity = c.Quantity,
        //    HospitalName = c.DonationPlace,
        //    DonationTime = c.DonationTime,
        //    DonationDate = c.DonationDate,
        //    ContactNo = c.ContactNumber,
        //    IsYourCase = c.IsYourCase,
        //    Status = c.CaseStatus.CaseStatusName
        //};

        //private IQueryable<CaseInfo> ReadOnly() => _context.CaseInfos.AsNoTracking();

        public async Task<IEnumerable<CaseRequest>> GetAllAsync()
        {
            //return await ReadOnly()
            //    .OrderBy(c => c.DonationDate)
            //    .ThenBy(c => c.DonationTime)
            //    .Select(ToDto)
            //    .ToListAsync();

            return await _context.QueryProcAsync<CaseRequest>($"EXEC dbo.usp_CaseRequest_GetAll");
        }

        public async Task<CaseRequest?> GetByIdAsync(int id)
        {
            //return await ReadOnly()
            //    .Where(c => c.CaseInfoId == id)
            //    .Select(ToDto)
            //    .FirstOrDefaultAsync();

            return await _context.QueryProcSingleAsync<CaseRequest>($"EXEC dbo.usp_CaseRequest_GetById @Id = {id}");
        }

        //public async Task<IEnumerable<CaseRequest>> GetByBloodGroupAsync(string bloodGroup)
        //{
        //    return await ReadOnly()
        //        .Where(c => c.BloodGroup.GroupName == bloodGroup)
        //        .OrderBy(c => c.DonationDate)
        //        .ThenBy(c => c.DonationTime)
        //        .Select(ToDto)
        //        .ToListAsync();
        //}

        //public async Task<IEnumerable<CaseRequest>> GetByDonationDateAsync(DateTime date)
        //{
        //    // range comparison stays index-friendly (no .Date on the column)
        //    var start = date.Date;
        //    var end = start.AddDays(1);
        //    return await ReadOnly()
        //        .Where(c => c.DonationDate >= start && c.DonationDate < end)
        //        .OrderBy(c => c.DonationTime)
        //        .Select(ToDto)
        //        .ToListAsync();
        //}

        public async Task<IEnumerable<CaseRequest>> SearchAsync(string? bloodGroup, DateTime? donationDate)
        {
            return await _context.QueryProcAsync<CaseRequest>(
                $"EXEC dbo.usp_CaseRequest_Search @BloodGroup = {bloodGroup}, @DonationDate = {donationDate}");
        }

        public async Task<IEnumerable<CaseRequest>> GetMyCasesAsync(string userId)
        {
            //return await ReadOnly()
            //    .Where(c => c.RequestedByUserId == userId)
            //    .OrderByDescending(c => c.Date)
            //    .Select(ToDto)
            //    .ToListAsync();

            return await _context.QueryProcAsync<CaseRequest>($"EXEC dbo.usp_CaseRequest_GetMine @UserId = {userId}");
        }

        public async Task<string?> GetOwnerIdAsync(int id)
        {
            //return ReadOnly()
            //    .Where(c => c.CaseInfoId == id)
            //    .Select(c => c.RequestedByUserId)
            //    .FirstOrDefaultAsync();

            return await _context.ScalarStringProcAsync($"EXEC dbo.usp_CaseRequest_GetOwnerId @Id = {id}");
        }

        public async Task<CaseRequest> AddAsync(CaseRequest request, string requestedByUserId)
        {
            var entity = new CaseInfo
            {
                PatientProblem = request.PatientProblem,
                BloodGroupId = await GetBloodGroupIdAsync(request.BloodGroup),
                Hemoglobin = request.Hemoglobin,
                Quantity = request.BloodQuantity,
                DonationPlace = request.HospitalName,
                DonationTime = request.DonationTime,
                DonationDate = request.DonationDate,
                ContactNumber = request.ContactNo,
                IsYourCase = request.IsYourCase,
                RequestedByUserId = requestedByUserId,
                CaseStatusId = await GetOrCreateStatusIdAsync(CaseStatusNames.Pending)
            };

            _context.CaseInfos.Add(entity);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(entity.CaseInfoId))!;
        }

        public async Task<bool> UpdateAsync(CaseRequest request)
        {
            var existing = await _context.CaseInfos.FindAsync(request.Id);
            if (existing is null) return false;

            existing.PatientProblem = request.PatientProblem;
            existing.BloodGroupId = await GetBloodGroupIdAsync(request.BloodGroup);
            existing.Hemoglobin = request.Hemoglobin;
            existing.Quantity = request.BloodQuantity;
            existing.DonationPlace = request.HospitalName;
            existing.DonationTime = request.DonationTime;
            existing.DonationDate = request.DonationDate;
            existing.ContactNumber = request.ContactNo;
            existing.IsYourCase = request.IsYourCase;
            // Status and owner are intentionally NOT editable here.

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            //var existing = await _context.CaseInfos.FindAsync(id);
            //if (existing is null) return false;

            //existing.CaseStatusId = await GetOrCreateStatusIdAsync(status);
            //await _context.SaveChangesAsync();
            //return true;

            var rows = await _context.ScalarIntProcAsync($"EXEC dbo.usp_CaseRequest_UpdateStatus @Id = {id}, @Status = {status}");
            return rows > 0;
        }

        public async Task<DeleteResult> DeleteAsync(int id)
        {
            //await using var tx = await _context.Database.BeginTransactionAsync();

            //var existing = await _context.CaseInfos.FindAsync(id);
            //if (existing is null) return false;

            //await _context.Notifications.Where(n => n.CaseInfoId == id).ExecuteDeleteAsync();
            //_context.CaseInfos.Remove(existing);
            //await _context.SaveChangesAsync();

            //await tx.CommitAsync();
            //return true;

            var result = await _context.ScalarIntProcAsync($"EXEC dbo.usp_CaseRequest_Delete @Id = {id}");
            return result switch
            {
                > 0 => DeleteResult.Deleted,
                0 => DeleteResult.NotFound,
                _ => DeleteResult.InUse
            };
        }

        // ---- lookups ----------------------------------------------------------------

        private async Task<int> GetBloodGroupIdAsync(string groupName)
        {
            var id = await _context.BloodGroups
                .Where(b => b.GroupName == groupName)
                .Select(b => (int?)b.BloodGroupId)
                .FirstOrDefaultAsync();

            // The DTO regex already guarantees a valid name, so a miss means the BloodGroups seed data is missing.
            return id ?? throw new InvalidOperationException($"Blood group '{groupName}' is not seeded in the database.");
        }

        private async Task<int> GetOrCreateStatusIdAsync(string statusName)
        {
            var status = await _context.CaseStatuses.FirstOrDefaultAsync(s => s.CaseStatusName == statusName);
            if (status is null)
            {
                status = new CaseStatus { CaseStatusName = statusName };
                _context.CaseStatuses.Add(status);
                await _context.SaveChangesAsync();
            }
            return status.CaseStatusId;
        }
    }
}
