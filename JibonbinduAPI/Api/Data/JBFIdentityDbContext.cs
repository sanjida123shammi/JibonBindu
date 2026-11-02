using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.DTOs;
using SharedLibrary.Models;
using System.Reflection.Emit;

namespace Api.Data
{
    public class JBFIdentityDbContext(DbContextOptions options) : IdentityDbContext<ApplicationUser> (options)
    {
        public virtual DbSet<AssociatedStatus> AssociatedStatuses { get; set; } = null!;
        public virtual DbSet<BloodDonation> BloodDonations { get; set; } = null!;
        public virtual DbSet<BloodDonor> BloodDonors { get; set; } = null!;
        public virtual DbSet<BloodGroup> BloodGroups { get; set; } = null!;
        public virtual DbSet<CaseAssociate> CaseAssociates { get; set; } = null!;
        public virtual DbSet<CaseAssociateRole> CaseAssociateRoles { get; set; } = null!;
        public virtual DbSet<CaseInfo> CaseInfos { get; set; } = null!;
        public virtual DbSet<CaseStatus> CaseStatuses { get; set; } = null!;
        public virtual DbSet<CashType> CashTypes { get; set; } = null!;
        public virtual DbSet<DailyCost> DailyCosts { get; set; } = null!;
        public virtual DbSet<DonorStatus> DonorStatuses { get; set; } = null!;
        public virtual DbSet<FundDeposit> FundDeposits { get; set; } = null!;
        public virtual DbSet<FundDonationType> FundDonationTypes { get; set; } = null!;
        public virtual DbSet<FundDonor> FundDonors { get; set; } = null!;
        public virtual DbSet<FundDonorType> FundDonorTypes { get; set; } = null!;
        public virtual DbSet<FundingType> FundingTypes { get; set; } = null!;
        public virtual DbSet<Notification> Notifications { get; set; } = null!;
        public virtual DbSet<Person> Persons { get; set; } = null!;
        public virtual DbSet<PersonRole> PersonRoles { get; set; } = null!;
        public virtual DbSet<SettlementStatus> SettlementStatuses { get; set; } = null!;
        public virtual DbSet<VolunteerAssociate> VolunteerAssociates { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // ---- result shapes of the stored procedures (no tables, no migrations) ----
            // They are read with context.Set<T>().FromSqlInterpolated("EXEC dbo.usp_...").
            builder.Entity<CaseRequest>().HasNoKey().ToView(null);
            builder.Entity<BloodDonorResponse>().HasNoKey().ToView(null);
            builder.Entity<NotificationDTO>().HasNoKey().ToView(null);

            builder.Entity<FundDepositResponse>().HasNoKey().ToView(null);
            builder.Entity<FundCostingResponse>().HasNoKey().ToView(null);
            builder.Entity<FundLookupRow>().HasNoKey().ToView(null);
            builder.Entity<FundDonorOption>().HasNoKey().ToView(null);
            builder.Entity<PersonOption>().HasNoKey().ToView(null);

            builder.Entity<BloodGroupDonationTotal>().HasNoKey().ToView(null);
            builder.Entity<BloodDonationTotal>().HasNoKey().ToView(null);
            builder.Entity<MonthlyBloodDonation>().HasNoKey().ToView(null);
            builder.Entity<YearlyFundDonation>().HasNoKey().ToView(null);
            builder.Entity<MonthlyFundDonation>().HasNoKey().ToView(null);

            // ---- CaseInfo relationships ----
            builder.Entity<CaseInfo>()
                .HasOne(c => c.HandledBy)
                .WithMany()
                .HasForeignKey(c => c.HandledById)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CaseInfo>()
                .HasOne(c => c.FirstUpdate)
                .WithMany()
                .HasForeignKey(c => c.FirstUpdateId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CaseInfo>()
                .HasOne(c => c.VolunteerAssociate)
                .WithMany()
                .HasForeignKey(c => c.VolunteerAssociateId)
                .OnDelete(DeleteBehavior.Restrict);


            // Links to the Identity user (SharedLibrary can't reference ApplicationUser, so the FK is declared here)
            builder.Entity<Person>()
                .HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(p => p.ApplicationUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Person>()
                .HasIndex(p => p.ApplicationUserId)
                .IsUnique();

            builder.Entity<CaseInfo>()
                .HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(c => c.RequestedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Notification>()
                .HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Notification>()
                .HasIndex(n => new { n.UserId, n.IsRead, n.CreatedAtUtc });

            builder.Entity<DailyCost>()
                .HasOne(d => d.Person)
                .WithMany()
                .HasForeignKey(d => d.SpentByPersonId)
                .OnDelete(DeleteBehavior.Restrict);

            // date columns used by the reports and by the date filters
            builder.Entity<DailyCost>().HasIndex(d => d.CostingDate);
            builder.Entity<FundDeposit>().HasIndex(d => d.FundDonationDate);
            builder.Entity<BloodDonation>().HasIndex(d => d.DonationDate);
            
            // One profile per person
            builder.Entity<BloodDonor>()
                .HasIndex(d => d.PersonId)
                .IsUnique();

            // Seed data the repositories look up by name
            builder.Entity<BloodGroup>().HasData(
                new BloodGroup { BloodGroupId = 1, GroupName = "A+" },
                new BloodGroup { BloodGroupId = 2, GroupName = "A-" },
                new BloodGroup { BloodGroupId = 3, GroupName = "B+" },
                new BloodGroup { BloodGroupId = 4, GroupName = "B-" },
                new BloodGroup { BloodGroupId = 5, GroupName = "AB+" },
                new BloodGroup { BloodGroupId = 6, GroupName = "AB-" },
                new BloodGroup { BloodGroupId = 7, GroupName = "O+" },
                new BloodGroup { BloodGroupId = 8, GroupName = "O-" });

            builder.Entity<CaseStatus>().HasData(
                new CaseStatus { CaseStatusId = 1, CaseStatusName = "Pending" },
                new CaseStatus { CaseStatusId = 2, CaseStatusName = "In Progress" },
                new CaseStatus { CaseStatusId = 3, CaseStatusName = "Fulfilled" },
                new CaseStatus { CaseStatusId = 4, CaseStatusName = "Cancelled" });

            builder.Entity<DonorStatus>().HasData(
                new DonorStatus { DonorStatusId = 1, StatusName = "Available" },
                new DonorStatus { DonorStatusId = 2, StatusName = "Unavailable" });

            builder.Entity<SettlementStatus>().HasData(
                new SettlementStatus { SettlementStatusId = 1, SettlementStatusTitle = "Paid" },
                new SettlementStatus { SettlementStatusId = 2, SettlementStatusTitle = "Due" });


            foreach (var property in builder.Model.GetEntityTypes()
                .SelectMany(t => t.GetProperties())
                .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
            {
                property.SetColumnType("decimal(18, 2)");
            }

            foreach (var foreignKey in builder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }
    }
}
