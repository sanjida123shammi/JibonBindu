using Api.Data;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.DTOs;
using SharedLibrary.Models;

namespace Api.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly JBFIdentityDbContext _context;

        public NotificationRepository(JBFIdentityDbContext context)
        {
            _context = context;
        }

        public async Task<int> CreateForUsersAsync(IEnumerable<string> userIds, string title, string message, string type, int? caseInfoId = null)
        {

            var ids = string.Join(",", userIds.Where(i => !string.IsNullOrWhiteSpace(i)).Distinct());
            if (ids.Length == 0) return 0;

            title = Truncate(title, 200);
            message = Truncate(message, 1000);

            return await _context.ScalarIntProcAsync($@"EXEC dbo.usp_Notification_CreateForUsers
                @UserIds = {ids},
                @Title = {title},
                @Message = {message},
                @Type = {type},
                @CaseInfoId = {caseInfoId}");
        }

        public async Task<int> NotifyRolesAsync(IEnumerable<string> roles, string? excludeUserId, string title, string message, string type, int? caseInfoId = null)
        {
            var roleList = string.Join(",", roles.Where(r => !string.IsNullOrWhiteSpace(r)).Distinct());
            if (roleList.Length == 0) return 0;

            title = Truncate(title, 200);
            message = Truncate(message, 1000);

            return await _context.ScalarIntProcAsync($@"EXEC dbo.usp_Notification_NotifyRoles
                @Roles = {roleList},
                @ExcludeUserId = {excludeUserId},
                @Title = {title},
                @Message = {message},
                @Type = {type},
                @CaseInfoId = {caseInfoId}");
        }

        public async Task<IEnumerable<NotificationDTO>> GetForUserAsync(string userId, bool unreadOnly, int take = 50)
        {
            take = Math.Clamp(take, 1, 200);
            return await _context.QueryProcAsync<NotificationDTO>(
                $"EXEC dbo.usp_Notification_GetForUser @UserId = {userId}, @UnreadOnly = {unreadOnly}, @Take = {take}");
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _context.ScalarIntProcAsync($"EXEC dbo.usp_Notification_GetUnreadCount @UserId = {userId}");
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
        {
            var rows = await _context.ScalarIntProcAsync($"EXEC dbo.usp_Notification_MarkAsRead @Id = {notificationId}, @UserId = {userId}");
            return rows > 0;
        }

        public async Task<int> MarkAllAsReadAsync(string userId)
        {
            return await _context.ScalarIntProcAsync($"EXEC dbo.usp_Notification_MarkAllAsRead @UserId = {userId}");
        }

        private static string Truncate(string value, int max) =>
            value.Length <= max ? value : value[..max];
    }
}
