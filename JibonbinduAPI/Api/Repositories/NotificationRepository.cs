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
            //var items = userIds
            //    .Distinct()
            //    .Select(uid => new Notification
            //    {
            //        UserId = uid,
            //        Title = Truncate(title, 200),
            //        Message = Truncate(message, 1000),
            //        Type = type,
            //        CaseInfoId = caseInfoId
            //    })
            //    .ToList();

            //if (items.Count == 0) return 0;

            //await _context.Notifications.AddRangeAsync(items);
            //await _context.SaveChangesAsync();

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
            //var query = _context.Notifications
            //    .AsNoTracking()
            //    .Where(n => n.UserId == userId);

            //if (unreadOnly)
            //    query = query.Where(n => !n.IsRead);

            //return await query
            //    .OrderByDescending(n => n.CreatedAtUtc)
            //    .Take(Math.Clamp(take, 1, 200))
            //    .Select(n => new NotificationDTO
            //    {
            //        Id = n.NotificationId,
            //        Title = n.Title,
            //        Message = n.Message,
            //        Type = n.Type,
            //        CaseInfoId = n.CaseInfoId,
            //        IsRead = n.IsRead,
            //        CreatedAtUtc = n.CreatedAtUtc
            //    })
            //    .ToListAsync();

            take = Math.Clamp(take, 1, 200);
            return await _context.QueryProcAsync<NotificationDTO>(
                $"EXEC dbo.usp_Notification_GetForUser @UserId = {userId}, @UnreadOnly = {unreadOnly}, @Take = {take}");
        }

        //public Task<int> GetUnreadCountAsync(string userId) =>
        //    _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _context.ScalarIntProcAsync($"EXEC dbo.usp_Notification_GetUnreadCount @UserId = {userId}");
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
        {
            //var rows = await _context.Notifications
            //    .Where(n => n.NotificationId == notificationId && n.UserId == userId)
            //    .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
            //return rows > 0;

            var rows = await _context.ScalarIntProcAsync($"EXEC dbo.usp_Notification_MarkAsRead @Id = {notificationId}, @UserId = {userId}");
            return rows > 0;
        }

        public async Task<int> MarkAllAsReadAsync(string userId)
        {
            //return await _context.Notifications
            //    .Where(n => n.UserId == userId && !n.IsRead)
            //    .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));

            return await _context.ScalarIntProcAsync($"EXEC dbo.usp_Notification_MarkAllAsRead @UserId = {userId}");
        }

        private static string Truncate(string value, int max) =>
            value.Length <= max ? value : value[..max];
    }
}
