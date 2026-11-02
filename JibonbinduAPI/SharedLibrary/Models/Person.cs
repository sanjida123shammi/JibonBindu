using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Models
{
    public class Person
    {
        public int PersonId { get; set; }

        public string? ApplicationUserId { get; set; }

        public required string FirstName { get; set; }

        public required string LastName { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime DateOfBirth { get; set; } = DateTime.Now;

        public required string ContactNumber { get; set; }

        public string? NIDNumber { get; set; }

        public string? BirthCertificateNo { get; set; }

        public string District { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string Area { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        public int PersonRoleId { get; set; }
        public virtual PersonRole PersonRole { get; set; } = null!;
    }
}
