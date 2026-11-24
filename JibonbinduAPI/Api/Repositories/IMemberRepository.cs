using SharedLibrary.DTOs;
using SharedLibrary.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Api.Repositories
{
    public interface IMemberRepository
    {
        Task<IEnumerable<MemberResponseDTO>> GetAllAsync();
        Task<MemberResponseDTO?> GetByIdAsync(string memberId);
        Task<MemberResponseDTO> CreateAsync(MemberDTO dto);
        Task<bool> UpdateAsync(string memberId, MemberDTO dto);
        Task<bool> DeleteAsync(string memberId);
        Task<IEnumerable<PersonRole>> GetPersonRolesAsync();
    }
}