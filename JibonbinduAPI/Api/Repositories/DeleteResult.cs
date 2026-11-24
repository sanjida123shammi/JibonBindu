namespace Api.Repositories
{
    public enum DeleteResult
    {
        Deleted,
        NotFound,
        /// <summary>Related records (e.g. blood donations) exist, so the row must be kept.</summary>
        InUse
    }
}
