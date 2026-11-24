namespace Api.Repositories
{
    public enum StatusUpdateResult
    {
        Updated,
        NotFound,
        /// <summary>The status id that was sent does not exist.</summary>
        InvalidStatus
    }
}
