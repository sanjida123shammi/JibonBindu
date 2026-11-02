namespace SharedLibrary.DTOs
{
    public class NotificationDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int? CaseInfoId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAtUtc { get; set; }
    }
}
