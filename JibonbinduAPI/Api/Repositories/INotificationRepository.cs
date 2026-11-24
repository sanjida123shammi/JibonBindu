using SharedLibrary.DTOs;

namespace Api.Repositories
{
    public interface INotificationRepository
    {
        /// Creates one notification row per recipient.
        Task<int> CreateForUsersAsync(IEnumerable<string> userIds, string title, string message, string type, int? caseInfoId = null);

        Task<int> NotifyRolesAsync(IEnumerable<string> roles, string? excludeUserId, string title, string message, string type, int? caseInfoId = null);

        Task<IEnumerable<NotificationDTO>> GetForUserAsync(string userId, bool unreadOnly, int take = 50);
        Task<int> GetUnreadCountAsync(string userId);
        Task<bool> MarkAsReadAsync(int notificationId, string userId);
        Task<int> MarkAllAsReadAsync(string userId);
    }
}
