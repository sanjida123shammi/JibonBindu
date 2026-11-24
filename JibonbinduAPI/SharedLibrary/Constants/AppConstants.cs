using System.Text.RegularExpressions;

namespace SharedLibrary.Constants
{
    public static class AppRoles
    {
        public const string Admin = "Admin";
        public const string Member = "Member";
        public const string User = "User";
        public const string Seeker = "Seeker";
        public const string BloodDonor = "BloodDonor";
        public const string FundDonor = "FundDonor";

        public const string AdminOrMember = Admin + "," + Member;
        public const string FundManagers = Admin;

        public static readonly string[] All = { Admin, Member, User, Seeker, BloodDonor, FundDonor };
    }

    public static class CaseStatusNames
    {
        public const string Pending = "Pending";
        public const string InProgress = "In Progress";
        public const string Fulfilled = "Fulfilled";
        public const string Cancelled = "Cancelled";

        public static readonly string[] All = { Pending, InProgress, Fulfilled, Cancelled };
    }

    public static class DonorStatusNames
    {
        public const string Available = "Available";
        public const string Unavailable = "Unavailable";
    }

    public static class PersonRoleNames
    {
        public const string BloodDonor = "Blood Donor";
    }

    public static class NotificationTypes
    {
        public const string NewBloodRequest = "NewBloodRequest";
        public const string CaseStatusChanged = "CaseStatusChanged";
        public const string NewDonorRegistered = "NewDonorRegistered";
        public const string MemberRequest = "MemberRequest";
    }

    public enum DonationType
    {
        WholeBlood,
        Plasma,
        Platelets
    }

    public static class DonationRules
    {
        public const int MinDonorAge = 18;
        public const int MaxDonorAge = 65;

        public const int WholeBloodIntervalDays = 100;
        public const int PlasmaIntervalDays = 28;
        public const int PlateletIntervalDays = 21;

        public static int GetIntervalDays(DonationType donationType) => donationType switch
        {
            DonationType.WholeBlood => WholeBloodIntervalDays,
            DonationType.Plasma => PlasmaIntervalDays,
            DonationType.Platelets => PlateletIntervalDays,
            _ => throw new ArgumentOutOfRangeException(nameof(donationType), $"Unsupported donation type: {donationType}")
        };
    }

    public static class BloodGroupFormat
    {
        private static readonly Regex Pattern = new("^(A|B|AB|O)[+-]$", RegexOptions.Compiled);

        /// <summary>
        /// A raw '+' in a query string is decoded as a space, so "A+" arrives as "A ".
        /// Spaces are therefore turned back into '+' before validating.
        /// </summary>
        public static bool TryNormalize(string? input, out string normalized)
        {
            normalized = (input ?? string.Empty).Replace(' ', '+').Trim().ToUpperInvariant();
            return Pattern.IsMatch(normalized);
        }
    }

    /// <summary>Route keys of the lookup tables used by the fund screens.</summary>
    public static class FundLookupKinds
    {
        public const string DonationTypes = "donation-types";
        public const string FundingTypes = "funding-types";
        public const string CashTypes = "cash-types";
        public const string DonorTypes = "donor-types";
        public const string SettlementStatuses = "settlement-statuses";

        public static readonly string[] All = { DonationTypes, FundingTypes, CashTypes, DonorTypes, SettlementStatuses };
    }

    public static class ReportRules
    {
        public const int MinYear = 2025;
        public const int MaxYear = 2100;
    }

    public static class MonthNames
    {
        /// <summary>English month name for 1-12 (culture independent). Empty string for anything else.</summary>
        public static string Get(int month) =>
            month is >= 1 and <= 12
                ? System.Globalization.CultureInfo.InvariantCulture.DateTimeFormat.GetMonthName(month)
                : string.Empty;
    }
}
