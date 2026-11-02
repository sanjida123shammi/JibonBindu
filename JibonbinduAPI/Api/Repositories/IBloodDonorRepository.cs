using SharedLibrary.Constants;
using SharedLibrary.DTOs;

namespace Api.Repositories
{
    public interface IBloodDonorRepository
    {
        Task<IEnumerable<BloodDonorResponse>> SearchAsync(string? bloodGroup, string? district, string? area, bool availableOnly, DonationType donationType);
        Task<BloodDonorResponse?> GetByIdAsync(int bloodDonorId);
        Task<BloodDonorResponse?> GetByUserIdAsync(string userId);

        /// Creates the Person (if needed) and the BloodDonor for the logged-in user.
        Task<BloodDonorResponse> RegisterAsync(string userId, BloodDonorDTO dto);

        Task<bool> UpdateByUserIdAsync(string userId, BloodDonorDTO dto);
        Task<DeleteResult> DeleteAsync(int bloodDonorId);
    }
}
