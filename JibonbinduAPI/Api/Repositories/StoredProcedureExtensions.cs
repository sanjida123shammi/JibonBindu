using Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories
{    
    internal static class StoredProcedureExtensions
    {
        /// <summary>Runs a procedure that returns rows shaped like keyless entity T.</summary>
        public static async Task<List<T>> QueryProcAsync<T>(this JBFIdentityDbContext context, FormattableString sql)
            where T : class
        {
            return await context.Set<T>().FromSqlInterpolated(sql).ToListAsync();
        }

        public static async Task<T?> QueryProcSingleAsync<T>(this JBFIdentityDbContext context, FormattableString sql)
            where T : class
        {
            var rows = await context.QueryProcAsync<T>(sql);
            return rows.FirstOrDefault();
        }

        /// <summary>Runs a procedure that returns one int in a column named [Value].</summary>
        public static async Task<int> ScalarIntProcAsync(this JBFIdentityDbContext context, FormattableString sql)
        {
            var rows = await context.Database.SqlQuery<int>(sql).ToListAsync();
            return rows.FirstOrDefault();
        }

        /// <summary>Runs a procedure that returns one (nullable) string in a column named [Value].</summary>
        public static async Task<string?> ScalarStringProcAsync(this JBFIdentityDbContext context, FormattableString sql)
        {
            var rows = await context.Database.SqlQuery<string?>(sql).ToListAsync();
            return rows.FirstOrDefault();
        }
    }
}
