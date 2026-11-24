using Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _users;

        public AuthController(IUserRepository users)
        {
            _users = users;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<ServiceResponse.GeneralResponse>> Register([FromBody] UserDTO userDTO)
        {
            var result = await _users.CreateAccount(userDTO);
            return result.Flag ? Ok(result) : BadRequest(result);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<ServiceResponse.LoginResponse>> Login([FromBody] LoginDTO loginDTO)
        {
            var result = await _users.LoginAccount(loginDTO);
            return result.Flag ? Ok(result) : Unauthorized(result);
        }

        [HttpGet("registration-roles")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<string>>> GetRegistrationRoles()
        {
            var roles = await _users.GetRegistrationRolesAsync();
            return Ok(roles);
        }

        /// <summary>Admin promotes a user to Member (blood-searching team), Admin, or demotes to User.</summary>
        [HttpPost("assign-role")]
        [Authorize(Roles = AppRoles.Admin)]
        public async Task<ActionResult<ServiceResponse.GeneralResponse>> AssignRole([FromBody] AssignRoleDTO dto)
        {
            var result = await _users.AssignRoleAsync(dto);
            return result.Flag ? Ok(result) : BadRequest(result);
        }

        [HttpGet("me")]
        [Authorize]
        public ActionResult<ServiceResponse.UserSession> Me()
        {
            return Ok(new ServiceResponse.UserSession(
                User.FindFirstValue(ClaimTypes.NameIdentifier),
                User.FindFirstValue(ClaimTypes.Name),
                User.FindFirstValue(ClaimTypes.Email),
                User.FindFirstValue(ClaimTypes.Role)));
        }
    }
}
