using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Models
{
    public class Member
    {
        [Key]
        [StringLength(20)]
        public string MemberID { get; set; } = string.Empty; // Formatted sequential ID: JBF-00# (e.g., JBF-001)
        [Required]
        public int PersonId { get; set; }
        public virtual Person Person { get; set; } = null!;
        [StringLength(50)]
        public string? NIDNumber { get; set; }
        [StringLength(50)]
        public string? BirthCertificateNo { get; set; }
        public string? ImageUrl { get; set; }
        [Required]
        public int PersonRoleID { get; set; }
        public virtual PersonRole PersonRole { get; set; } = null!;
    }
}
