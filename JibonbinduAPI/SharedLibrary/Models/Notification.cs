using System.ComponentModel.DataAnnotations;
using SharedLibrary.Constants;

namespace SharedLibrary.Models
{
    public class Notification
    {
        public int NotificationId { get; set; }

        /// ApplicationUser.Id of the recipient (FK is configured in the DbContext).
        public required string UserId { get; set; }

        [MaxLength(200)]
        public required string Title { get; set; }

        [MaxLength(1000)]
        public required string Message { get; set; }

        // Optional
        [MaxLength(50)]
        public string Type { get; set; } = NotificationTypes.NewBloodRequest;

        public int? CaseInfoId { get; set; }
        public virtual CaseInfo? CaseInfo { get; set; }

        // Think later
        public bool IsRead { get; set; }

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
