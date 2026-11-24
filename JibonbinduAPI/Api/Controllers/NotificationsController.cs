using Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.DTOs;
using System.Security.Claims;

namespace Api.Controllers
{
    /// <summary>The in-app inbox where Admin / team members see new requests and donors.</summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationRepository _notifications;

        public NotificationsController(INotificationRepository notifications)
        {
            _notifications = notifications;
        }

        private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // GET api/notifications?unreadOnly=true&take=50
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationDTO>>> GetMine([FromQuery] bool unreadOnly = false, [FromQuery] int take = 50)
        {
            var userId = CurrentUserId;
            if (userId is null) return Unauthorized();

            return Ok(await _notifications.GetForUserAsync(userId, unreadOnly, take));
        }

        // GET api/notifications/unread-count   (for the bell badge)
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var userId = CurrentUserId;
            if (userId is null) return Unauthorized();

            return Ok(await _notifications.GetUnreadCountAsync(userId));
        }

        // PATCH api/notifications/12/read
        [HttpPatch("{id:int}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = CurrentUserId;
            if (userId is null) return Unauthorized();

            return await _notifications.MarkAsReadAsync(id, userId) ? NoContent() : NotFound();
        }

        // PATCH api/notifications/read-all
        [HttpPatch("read-all")]
        public async Task<ActionResult<int>> MarkAllAsRead()
        {
            var userId = CurrentUserId;
            if (userId is null) return Unauthorized();

            return Ok(await _notifications.MarkAllAsReadAsync(userId));
        }
    }
}
