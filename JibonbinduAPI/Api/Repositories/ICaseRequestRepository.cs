using SharedLibrary.DTOs;

namespace Api.Repositories
{
    public interface ICaseRequestRepository
    {
        Task<IEnumerable<CaseRequest>> GetAllAsync();
        Task<CaseRequest?> GetByIdAsync(int id);

        Task<IEnumerable<CaseRequest>> SearchAsync(string? bloodGroup, DateTime? donationDate);

        Task<IEnumerable<CaseRequest>> GetMyCasesAsync(string userId);

        /// <summary>ApplicationUser.Id of whoever submitted the request (null if unknown).</summary>
        Task<string?> GetOwnerIdAsync(int id);

        Task<CaseRequest> AddAsync(CaseRequest request, string requestedByUserId);
        Task<bool> UpdateAsync(CaseRequest request);
        Task<bool> UpdateStatusAsync(int id, string status);
        Task<DeleteResult> DeleteAsync(int id);
    }
}
