using System.ComponentModel.DataAnnotations;

namespace SharedLibrary.DTOs
{
    public class RoleItemDTO
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class CreateRoleDTO
    {
        [Required, StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;
    }

    public class MemberLookupDTO
    {
        public string MemberID { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
    }

    public class MemberAssignedRolesDTO
    {
        public string MemberID { get; set; } = string.Empty;
        public string MemberName { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public List<string> RoleIds { get; set; } = new();
        public List<string> RoleNames { get; set; } = new();
        public string RoleNamesDisplay => RoleNames.Count > 0 ? string.Join(", ", RoleNames) : "None";
    }

    public class AssignMemberRolesDTO
    {
        [Required]
        public string MemberID { get; set; } = string.Empty;
        public List<string> RoleIds { get; set; } = new();
    }

    public class UserDetailDTO
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public List<string> Roles { get; set; } = new();
        public string? MemberID { get; set; }
        public bool EmailConfirmed { get; set; }
        public bool IsLockedOut { get; set; }
    }
}