using Api.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using SharedLibrary.Constants;
using SharedLibrary.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using static SharedLibrary.DTOs.ServiceResponse;

namespace Api.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _config;

        public UserRepository(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration config)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _config = config;
        }

        public async Task<GeneralResponse> CreateAccount(UserDTO userDTO)
        {
            if (userDTO is null)
                return new GeneralResponse(false, "User data is null");

            if (string.IsNullOrWhiteSpace(userDTO.Email) || string.IsNullOrWhiteSpace(userDTO.Password))
                return new GeneralResponse(false, "Email and password are required");

            if (await _userManager.FindByEmailAsync(userDTO.Email) is not null)
                return new GeneralResponse(false, "User already exists");

            // Determine the selected role (defaults to Seeker if unspecified)
            var normalizedRole = userDTO.Role?.Trim() switch
            {
                "BloodDonor" or "Blood-Donor" => AppRoles.BloodDonor,
                "FundDonor" or "Fund-Donor" => AppRoles.FundDonor,
                "Member" => AppRoles.Member,
                _ => AppRoles.Seeker
            };

            // If this is the very first account, assign Admin; otherwise assign the selected role
            var isFirstAccount = (await _userManager.GetUsersInRoleAsync(AppRoles.Admin)).Count == 0;
            var primaryRole = isFirstAccount ? AppRoles.Admin : normalizedRole;

            var newUser = new ApplicationUser
            {
                Name = userDTO.Name,
                Email = userDTO.Email,
                UserName = userDTO.Email,
                Location = "Dhaka, Bangladesh",
                AvatarUrl = "/images/users/default-avatar.jpg"
            };

            var createUser = await _userManager.CreateAsync(newUser, userDTO.Password);
            if (!createUser.Succeeded)
                return new GeneralResponse(false, string.Join("; ", createUser.Errors.Select(e => e.Description)));

            // Ensure roles exist in dbo.AspNetRoles
            await EnsureRoleAsync(AppRoles.User);
            await EnsureRoleAsync(primaryRole);

            // Assign base 'User' role and the chosen joining role in dbo.AspNetUserRoles
            await _userManager.AddToRoleAsync(newUser, AppRoles.User);
            if (primaryRole != AppRoles.User)
            {
                await _userManager.AddToRoleAsync(newUser, primaryRole);
            }

            return new GeneralResponse(true, "Account created successfully");
        }

        public async Task<LoginResponse> LoginAccount(LoginDTO loginDTO)
        {
            if (loginDTO is null)
                return new LoginResponse(false, "Login data is null", null!);

            var getUser = await _userManager.FindByEmailAsync(loginDTO.Email);
            if (getUser is null)
                return new LoginResponse(false, "Invalid email or password", null!);

            var signIn = await _signInManager.CheckPasswordSignInAsync(getUser, loginDTO.Password, lockoutOnFailure: true);
            if (signIn.IsLockedOut)
                return new LoginResponse(false, "Account is temporarily locked. Please try again later", null!);
            if (!signIn.Succeeded)
                return new LoginResponse(false, "Invalid email or password", null!);

            var roles = await _userManager.GetRolesAsync(getUser);

            // Prioritize higher privileges: Admin > Member > User
            var primaryRole = roles.Contains(AppRoles.Admin)
                ? AppRoles.Admin
                : roles.Contains(AppRoles.Member)
                    ? AppRoles.Member
                    : roles.FirstOrDefault() ?? AppRoles.User;

            var userSession = new UserSession(getUser.Id, getUser.Name, getUser.Email, primaryRole);

            return new LoginResponse(true, "Login successful", GenerateToken(userSession, roles));
        }

        public async Task<GeneralResponse> AssignRoleAsync(AssignRoleDTO dto)
        {
            var role = AppRoles.All.FirstOrDefault(r => string.Equals(r, dto.Role, StringComparison.OrdinalIgnoreCase));
            if (role is null)
                return new GeneralResponse(false, $"Role must be one of: {string.Join(", ", AppRoles.All)}");

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user is null)
                return new GeneralResponse(false, "User not found");

            var currentRoles = await _userManager.GetRolesAsync(user);

            // never leave the system without an administrator
            if (currentRoles.Contains(AppRoles.Admin) && role != AppRoles.Admin)
            {
                var admins = await _userManager.GetUsersInRoleAsync(AppRoles.Admin);
                if (admins.Count <= 1)
                    return new GeneralResponse(false, "Cannot change the role of the last Admin");
            }

            await EnsureRoleAsync(role);

            if (currentRoles.Count > 0)
            {
                var remove = await _userManager.RemoveFromRolesAsync(user, currentRoles);
                if (!remove.Succeeded)
                    return new GeneralResponse(false, "Could not remove the user's current role");
            }

            var add = await _userManager.AddToRoleAsync(user, role);
            return add.Succeeded
                ? new GeneralResponse(true, $"{user.Email} is now {role}. The change applies to new logins.")
                : new GeneralResponse(false, "Could not assign the new role");
        }

        public async Task<IReadOnlyCollection<string>> GetUserIdsInRolesAsync(params string[] roles)
        {
            var ids = new HashSet<string>();
            foreach (var role in roles)
            {
                var users = await _userManager.GetUsersInRoleAsync(role);
                foreach (var u in users)
                    ids.Add(u.Id);
            }
            return ids;
        }

        public async Task<IEnumerable<string>> GetRegistrationRolesAsync()
        {
            var roles = new[] { AppRoles.Seeker, AppRoles.BloodDonor, AppRoles.FundDonor, AppRoles.Member };
            foreach (var r in roles)
            {
                await EnsureRoleAsync(r);
            }
            return roles;
        }

        private async Task EnsureRoleAsync(string roleName)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
                await _roleManager.CreateAsync(new IdentityRole { Name = roleName });
        }

        private string GenerateToken(UserSession user, IEnumerable<string>? roles = null)
        {
            var securityKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
                new Claim(ClaimTypes.Name, user.Name ?? user.Email ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            };

            var roleList = roles?.ToList() ?? new List<string>();
            if (roleList.Count == 0 && !string.IsNullOrWhiteSpace(user.Role))
            {
                roleList.Add(user.Role);
            }
            if (roleList.Count == 0)
            {
                roleList.Add(AppRoles.User);
            }

            // Add claims for all user roles using both standard ClaimTypes.Role and "role"
            foreach (var r in roleList)
            {
                claims.Add(new Claim(ClaimTypes.Role, r));
                claims.Add(new Claim("role", r));
            }

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"]!,
                audience: _config["Jwt:Audience"]!,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
