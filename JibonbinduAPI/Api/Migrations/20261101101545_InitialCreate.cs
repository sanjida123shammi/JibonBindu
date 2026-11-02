using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AssociatedStatuses",
                columns: table => new
                {
                    AssociatedStatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssociatedStatuses", x => x.AssociatedStatusId);
                });

            migrationBuilder.CreateTable(
                name: "BloodGroups",
                columns: table => new
                {
                    BloodGroupId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BloodGroups", x => x.BloodGroupId);
                });

            migrationBuilder.CreateTable(
                name: "CaseAssociateRoles",
                columns: table => new
                {
                    CaseAssociateRoleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaseAssociateRoles", x => x.CaseAssociateRoleId);
                });

            migrationBuilder.CreateTable(
                name: "CaseStatuses",
                columns: table => new
                {
                    CaseStatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CaseStatusName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaseStatuses", x => x.CaseStatusId);
                });

            migrationBuilder.CreateTable(
                name: "CashTypes",
                columns: table => new
                {
                    CashTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CashTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CashTypes", x => x.CashTypeId);
                });

            migrationBuilder.CreateTable(
                name: "DonorStatuses",
                columns: table => new
                {
                    DonorStatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonorStatuses", x => x.DonorStatusId);
                });

            migrationBuilder.CreateTable(
                name: "FundDonationTypes",
                columns: table => new
                {
                    FundDonationTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DonationTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundDonationTypes", x => x.FundDonationTypeId);
                });

            migrationBuilder.CreateTable(
                name: "FundDonorTypes",
                columns: table => new
                {
                    FundDonorTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FundDonorTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundDonorTypes", x => x.FundDonorTypeId);
                });

            migrationBuilder.CreateTable(
                name: "FundingTypes",
                columns: table => new
                {
                    FundingTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FundingTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundingTypes", x => x.FundingTypeId);
                });

            migrationBuilder.CreateTable(
                name: "PersonRoles",
                columns: table => new
                {
                    PersonRoleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PersonRoleName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonRoles", x => x.PersonRoleId);
                });

            migrationBuilder.CreateTable(
                name: "SettlementStatuses",
                columns: table => new
                {
                    SettlementStatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SettlementStatusTitle = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SettlementStatuses", x => x.SettlementStatusId);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CaseAssociates",
                columns: table => new
                {
                    CaseAssociateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PersonId = table.Column<int>(type: "int", nullable: false),
                    CaseAssociateRoleId = table.Column<int>(type: "int", nullable: false),
                    AssociatedStatusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaseAssociates", x => x.CaseAssociateId);
                    table.ForeignKey(
                        name: "FK_CaseAssociates_AssociatedStatuses_AssociatedStatusId",
                        column: x => x.AssociatedStatusId,
                        principalTable: "AssociatedStatuses",
                        principalColumn: "AssociatedStatusId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CaseAssociates_CaseAssociateRoles_CaseAssociateRoleId",
                        column: x => x.CaseAssociateRoleId,
                        principalTable: "CaseAssociateRoles",
                        principalColumn: "CaseAssociateRoleId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Persons",
                columns: table => new
                {
                    PersonId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContactNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NIDNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BirthCertificateNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    District = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Area = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PersonRoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Persons", x => x.PersonId);
                    table.ForeignKey(
                        name: "FK_Persons_AspNetUsers_ApplicationUserId",
                        column: x => x.ApplicationUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Persons_PersonRoles_PersonRoleId",
                        column: x => x.PersonRoleId,
                        principalTable: "PersonRoles",
                        principalColumn: "PersonRoleId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BloodDonors",
                columns: table => new
                {
                    BloodDonorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PersonId = table.Column<int>(type: "int", nullable: false),
                    BloodGroupId = table.Column<int>(type: "int", nullable: false),
                    LastDonationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastDonationType = table.Column<int>(type: "int", nullable: false),
                    DonorStatusId = table.Column<int>(type: "int", nullable: false),
                    TotalDonation = table.Column<int>(type: "int", nullable: false),
                    PreferredLocation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PreferredTime = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BloodDonors", x => x.BloodDonorId);
                    table.ForeignKey(
                        name: "FK_BloodDonors_BloodGroups_BloodGroupId",
                        column: x => x.BloodGroupId,
                        principalTable: "BloodGroups",
                        principalColumn: "BloodGroupId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BloodDonors_DonorStatuses_DonorStatusId",
                        column: x => x.DonorStatusId,
                        principalTable: "DonorStatuses",
                        principalColumn: "DonorStatusId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BloodDonors_Persons_PersonId",
                        column: x => x.PersonId,
                        principalTable: "Persons",
                        principalColumn: "PersonId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DailyCosts",
                columns: table => new
                {
                    DailyCostId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CostingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SpentByPersonId = table.Column<int>(type: "int", nullable: false),
                    CostAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SettlementStatusId = table.Column<int>(type: "int", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyCosts", x => x.DailyCostId);
                    table.ForeignKey(
                        name: "FK_DailyCosts_Persons_SpentByPersonId",
                        column: x => x.SpentByPersonId,
                        principalTable: "Persons",
                        principalColumn: "PersonId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DailyCosts_SettlementStatuses_SettlementStatusId",
                        column: x => x.SettlementStatusId,
                        principalTable: "SettlementStatuses",
                        principalColumn: "SettlementStatusId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FundDonors",
                columns: table => new
                {
                    FundDonorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PersonId = table.Column<int>(type: "int", nullable: false),
                    FundDonorTypeId = table.Column<int>(type: "int", nullable: false),
                    DonationSlot = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PayAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundDonors", x => x.FundDonorId);
                    table.ForeignKey(
                        name: "FK_FundDonors_FundDonorTypes_FundDonorTypeId",
                        column: x => x.FundDonorTypeId,
                        principalTable: "FundDonorTypes",
                        principalColumn: "FundDonorTypeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FundDonors_Persons_PersonId",
                        column: x => x.PersonId,
                        principalTable: "Persons",
                        principalColumn: "PersonId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VolunteerAssociates",
                columns: table => new
                {
                    VolunteerAssociateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PersonId = table.Column<int>(type: "int", nullable: false),
                    AssociatedStatusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VolunteerAssociates", x => x.VolunteerAssociateId);
                    table.ForeignKey(
                        name: "FK_VolunteerAssociates_AssociatedStatuses_AssociatedStatusId",
                        column: x => x.AssociatedStatusId,
                        principalTable: "AssociatedStatuses",
                        principalColumn: "AssociatedStatusId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VolunteerAssociates_Persons_PersonId",
                        column: x => x.PersonId,
                        principalTable: "Persons",
                        principalColumn: "PersonId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FundDeposits",
                columns: table => new
                {
                    FundDepositId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FundDonationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FundDonationTypeId = table.Column<int>(type: "int", nullable: false),
                    FundDonorId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FundReceiver = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FundingTypeId = table.Column<int>(type: "int", nullable: false),
                    CashTypeId = table.Column<int>(type: "int", nullable: false),
                    Months = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundDeposits", x => x.FundDepositId);
                    table.ForeignKey(
                        name: "FK_FundDeposits_CashTypes_CashTypeId",
                        column: x => x.CashTypeId,
                        principalTable: "CashTypes",
                        principalColumn: "CashTypeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FundDeposits_FundDonationTypes_FundDonationTypeId",
                        column: x => x.FundDonationTypeId,
                        principalTable: "FundDonationTypes",
                        principalColumn: "FundDonationTypeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FundDeposits_FundDonors_FundDonorId",
                        column: x => x.FundDonorId,
                        principalTable: "FundDonors",
                        principalColumn: "FundDonorId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FundDeposits_FundingTypes_FundingTypeId",
                        column: x => x.FundingTypeId,
                        principalTable: "FundingTypes",
                        principalColumn: "FundingTypeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CaseInfos",
                columns: table => new
                {
                    CaseInfoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BloodGroupId = table.Column<int>(type: "int", nullable: false),
                    PatientProblem = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Hemoglobin = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DonationDate = table.Column<DateOnly>(type: "date", nullable: false),
                    DonationTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    DonationPlace = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactNumber = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: false),
                    IsYourCase = table.Column<bool>(type: "bit", nullable: false),
                    RequestedByUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CaseStatusId = table.Column<int>(type: "int", nullable: false),
                    HandledById = table.Column<int>(type: "int", nullable: true),
                    FirstUpdateId = table.Column<int>(type: "int", nullable: true),
                    VolunteerAssociateId = table.Column<int>(type: "int", nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaseInfos", x => x.CaseInfoId);
                    table.ForeignKey(
                        name: "FK_CaseInfos_AspNetUsers_RequestedByUserId",
                        column: x => x.RequestedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CaseInfos_BloodGroups_BloodGroupId",
                        column: x => x.BloodGroupId,
                        principalTable: "BloodGroups",
                        principalColumn: "BloodGroupId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CaseInfos_CaseAssociates_FirstUpdateId",
                        column: x => x.FirstUpdateId,
                        principalTable: "CaseAssociates",
                        principalColumn: "CaseAssociateId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CaseInfos_CaseAssociates_HandledById",
                        column: x => x.HandledById,
                        principalTable: "CaseAssociates",
                        principalColumn: "CaseAssociateId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CaseInfos_CaseStatuses_CaseStatusId",
                        column: x => x.CaseStatusId,
                        principalTable: "CaseStatuses",
                        principalColumn: "CaseStatusId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CaseInfos_VolunteerAssociates_VolunteerAssociateId",
                        column: x => x.VolunteerAssociateId,
                        principalTable: "VolunteerAssociates",
                        principalColumn: "VolunteerAssociateId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BloodDonations",
                columns: table => new
                {
                    BloodDonationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DonationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BloodDonorId = table.Column<int>(type: "int", nullable: false),
                    BloodGroupId = table.Column<int>(type: "int", nullable: false),
                    CaseInfoId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BloodDonations", x => x.BloodDonationId);
                    table.ForeignKey(
                        name: "FK_BloodDonations_BloodDonors_BloodDonorId",
                        column: x => x.BloodDonorId,
                        principalTable: "BloodDonors",
                        principalColumn: "BloodDonorId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BloodDonations_BloodGroups_BloodGroupId",
                        column: x => x.BloodGroupId,
                        principalTable: "BloodGroups",
                        principalColumn: "BloodGroupId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BloodDonations_CaseInfos_CaseInfoId",
                        column: x => x.CaseInfoId,
                        principalTable: "CaseInfos",
                        principalColumn: "CaseInfoId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CaseInfoId = table.Column<int>(type: "int", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationId);
                    table.ForeignKey(
                        name: "FK_Notifications_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_CaseInfos_CaseInfoId",
                        column: x => x.CaseInfoId,
                        principalTable: "CaseInfos",
                        principalColumn: "CaseInfoId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "BloodGroups",
                columns: new[] { "BloodGroupId", "GroupName" },
                values: new object[,]
                {
                    { 1, "A+" },
                    { 2, "A-" },
                    { 3, "B+" },
                    { 4, "B-" },
                    { 5, "AB+" },
                    { 6, "AB-" },
                    { 7, "O+" },
                    { 8, "O-" }
                });

            migrationBuilder.InsertData(
                table: "CaseStatuses",
                columns: new[] { "CaseStatusId", "CaseStatusName" },
                values: new object[,]
                {
                    { 1, "Pending" },
                    { 2, "In Progress" },
                    { 3, "Fulfilled" },
                    { 4, "Cancelled" }
                });

            migrationBuilder.InsertData(
                table: "DonorStatuses",
                columns: new[] { "DonorStatusId", "StatusName" },
                values: new object[,]
                {
                    { 1, "Available" },
                    { 2, "Unavailable" }
                });

            migrationBuilder.InsertData(
                table: "SettlementStatuses",
                columns: new[] { "SettlementStatusId", "SettlementStatusTitle" },
                values: new object[,]
                {
                    { 1, "Paid" },
                    { 2, "Due" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_BloodDonations_BloodDonorId",
                table: "BloodDonations",
                column: "BloodDonorId");

            migrationBuilder.CreateIndex(
                name: "IX_BloodDonations_BloodGroupId",
                table: "BloodDonations",
                column: "BloodGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_BloodDonations_CaseInfoId",
                table: "BloodDonations",
                column: "CaseInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_BloodDonations_DonationDate",
                table: "BloodDonations",
                column: "DonationDate");

            migrationBuilder.CreateIndex(
                name: "IX_BloodDonors_BloodGroupId",
                table: "BloodDonors",
                column: "BloodGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_BloodDonors_DonorStatusId",
                table: "BloodDonors",
                column: "DonorStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_BloodDonors_PersonId",
                table: "BloodDonors",
                column: "PersonId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CaseAssociates_AssociatedStatusId",
                table: "CaseAssociates",
                column: "AssociatedStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_CaseAssociates_CaseAssociateRoleId",
                table: "CaseAssociates",
                column: "CaseAssociateRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_CaseInfos_BloodGroupId",
                table: "CaseInfos",
                column: "BloodGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_CaseInfos_CaseStatusId",
                table: "CaseInfos",
                column: "CaseStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_CaseInfos_FirstUpdateId",
                table: "CaseInfos",
                column: "FirstUpdateId");

            migrationBuilder.CreateIndex(
                name: "IX_CaseInfos_HandledById",
                table: "CaseInfos",
                column: "HandledById");

            migrationBuilder.CreateIndex(
                name: "IX_CaseInfos_RequestedByUserId",
                table: "CaseInfos",
                column: "RequestedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CaseInfos_VolunteerAssociateId",
                table: "CaseInfos",
                column: "VolunteerAssociateId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyCosts_CostingDate",
                table: "DailyCosts",
                column: "CostingDate");

            migrationBuilder.CreateIndex(
                name: "IX_DailyCosts_SettlementStatusId",
                table: "DailyCosts",
                column: "SettlementStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyCosts_SpentByPersonId",
                table: "DailyCosts",
                column: "SpentByPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_FundDeposits_CashTypeId",
                table: "FundDeposits",
                column: "CashTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_FundDeposits_FundDonationDate",
                table: "FundDeposits",
                column: "FundDonationDate");

            migrationBuilder.CreateIndex(
                name: "IX_FundDeposits_FundDonationTypeId",
                table: "FundDeposits",
                column: "FundDonationTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_FundDeposits_FundDonorId",
                table: "FundDeposits",
                column: "FundDonorId");

            migrationBuilder.CreateIndex(
                name: "IX_FundDeposits_FundingTypeId",
                table: "FundDeposits",
                column: "FundingTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_FundDonors_FundDonorTypeId",
                table: "FundDonors",
                column: "FundDonorTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_FundDonors_PersonId",
                table: "FundDonors",
                column: "PersonId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CaseInfoId",
                table: "Notifications",
                column: "CaseInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_IsRead_CreatedAtUtc",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Persons_ApplicationUserId",
                table: "Persons",
                column: "ApplicationUserId",
                unique: true,
                filter: "[ApplicationUserId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Persons_PersonRoleId",
                table: "Persons",
                column: "PersonRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerAssociates_AssociatedStatusId",
                table: "VolunteerAssociates",
                column: "AssociatedStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerAssociates_PersonId",
                table: "VolunteerAssociates",
                column: "PersonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "BloodDonations");

            migrationBuilder.DropTable(
                name: "DailyCosts");

            migrationBuilder.DropTable(
                name: "FundDeposits");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "BloodDonors");

            migrationBuilder.DropTable(
                name: "SettlementStatuses");

            migrationBuilder.DropTable(
                name: "CashTypes");

            migrationBuilder.DropTable(
                name: "FundDonationTypes");

            migrationBuilder.DropTable(
                name: "FundDonors");

            migrationBuilder.DropTable(
                name: "FundingTypes");

            migrationBuilder.DropTable(
                name: "CaseInfos");

            migrationBuilder.DropTable(
                name: "DonorStatuses");

            migrationBuilder.DropTable(
                name: "FundDonorTypes");

            migrationBuilder.DropTable(
                name: "BloodGroups");

            migrationBuilder.DropTable(
                name: "CaseAssociates");

            migrationBuilder.DropTable(
                name: "CaseStatuses");

            migrationBuilder.DropTable(
                name: "VolunteerAssociates");

            migrationBuilder.DropTable(
                name: "CaseAssociateRoles");

            migrationBuilder.DropTable(
                name: "AssociatedStatuses");

            migrationBuilder.DropTable(
                name: "Persons");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "PersonRoles");
        }
    }
}
