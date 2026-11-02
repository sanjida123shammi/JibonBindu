using SharedLibrary.DTOs;
using static SharedLibrary.DTOs.ServiceResponse;

namespace Api.Repositories
{
    public interface IUserRepository
    {
        Task<GeneralResponse> CreateAccount(UserDTO userDTO);
        Task<LoginResponse> LoginAccount(LoginDTO loginDTO);

        Task<GeneralResponse> AssignRoleAsync(AssignRoleDTO dto);

        /// Ids of every user that holds at least one of the given roles (used for notifications).
        Task<IReadOnlyCollection<string>> GetUserIdsInRolesAsync(params string[] roles);
    }
}
