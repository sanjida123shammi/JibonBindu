/* =====================================================================================
   Blood Donation Foundation - views and stored procedures
   Run AFTER "dotnet ef database update" (the tables must exist). Safe to re-run.
   Requires SQL Server 2016 SP1+ (CREATE OR ALTER, STRING_SPLIT; compatibility level >= 130).

   Conventions
   - Every SELECT procedure returns columns named exactly like the C# DTO properties.
   - Every write procedure returns ONE row with ONE column named [Value]:
       create -> the new id
       update -> number of rows changed (0 = not found)
       delete -> 1 deleted, 0 not found, -1 blocked because related records exist
   ===================================================================================== */

/* ------------------------------- VIEWS ------------------------------------------- */
GO
CREATE OR ALTER VIEW dbo.vwCaseRequests
AS
SELECT  c.CaseInfoId        AS Id,
        c.PatientProblem    AS PatientProblem,
        bg.GroupName        AS BloodGroup,
        c.Hemoglobin        AS Hemoglobin,
        c.Quantity          AS BloodQuantity,
        c.DonationPlace     AS HospitalName,
        c.DonationTime      AS DonationTime,
        c.DonationDate      AS DonationDate,
        c.ContactNumber     AS ContactNo,
        c.IsYourCase        AS IsYourCase,
        cs.CaseStatusName   AS [Status],
        c.RequestedByUserId AS RequestedByUserId,
        c.[Date]            AS CreatedOn
FROM dbo.CaseInfos c
JOIN dbo.BloodGroups  bg ON bg.BloodGroupId  = c.BloodGroupId
JOIN dbo.CaseStatuses cs ON cs.CaseStatusId  = c.CaseStatusId;
GO

CREATE OR ALTER VIEW dbo.vwBloodDonors
AS
SELECT  d.BloodDonorId,
        d.PersonId,
        p.ApplicationUserId,
        p.FirstName,
        p.LastName,
        p.FirstName + N' ' + p.LastName       AS FullName,
        p.DateOfBirth,
        CAST(p.ContactNumber AS nvarchar(20)) AS ContactNo,
        p.District,
        p.City,
        p.Area,
        bg.GroupName                          AS BloodGroup,
        d.LastDonationDate,
        d.LastDonationType,
        ds.StatusName                         AS [Status],
        d.TotalDonation,
        ISNULL((SELECT COUNT(*) FROM dbo.BloodDonations bd WHERE bd.BloodDonorId = d.BloodDonorId), 0) AS DonationFromJbf,
        d.PreferredLocation,
        d.PreferredTime,
        d.Remarks
FROM dbo.BloodDonors d
JOIN dbo.Persons p        ON p.PersonId = d.PersonId
JOIN dbo.BloodGroups bg   ON bg.BloodGroupId = d.BloodGroupId
JOIN dbo.DonorStatuses ds ON ds.DonorStatusId = d.DonorStatusId;
GO

/* =========================== CASE REQUESTS ======================================== */

CREATE OR ALTER PROCEDURE dbo.usp_CaseRequest_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, PatientProblem, BloodGroup, Hemoglobin, BloodQuantity, HospitalName,
           DonationTime, DonationDate, ContactNo, IsYourCase, [Status]
    FROM dbo.vwCaseRequests
    ORDER BY DonationDate, DonationTime;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_CaseRequest_GetById
    @Id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, PatientProblem, BloodGroup, Hemoglobin, BloodQuantity, HospitalName,
           DonationTime, DonationDate, ContactNo, IsYourCase, [Status]
    FROM dbo.vwCaseRequests
    WHERE Id = @Id;
END
GO

/* Optional filters: NULL = "do not filter on this". */
CREATE OR ALTER PROCEDURE dbo.usp_CaseRequest_Search
    @BloodGroup   nvarchar(10)  = NULL,
    @DonationDate date  = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @From datetime2(7) = CAST(@DonationDate AS datetime2(7));
    DECLARE @To   datetime2(7) = DATEADD(DAY, 1, @From);

    SELECT Id, PatientProblem, BloodGroup, Hemoglobin, BloodQuantity, HospitalName,
           DonationTime, DonationDate, ContactNo, IsYourCase, [Status]
    FROM dbo.vwCaseRequests
    WHERE (@BloodGroup   IS NULL OR BloodGroup = @BloodGroup)
      AND (@DonationDate IS NULL OR (DonationDate >= @From AND DonationDate < @To))
    ORDER BY DonationDate, DonationTime
    OPTION (RECOMPILE);
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_CaseRequest_GetMine
    @UserId nvarchar(450)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, PatientProblem, BloodGroup, Hemoglobin, BloodQuantity, HospitalName,
           DonationTime, DonationDate, ContactNo, IsYourCase, [Status]
    FROM dbo.vwCaseRequests
    WHERE RequestedByUserId = @UserId
    ORDER BY CreatedOn DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_CaseRequest_GetOwnerId
    @Id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT RequestedByUserId AS [Value]
    FROM dbo.CaseInfos
    WHERE CaseInfoId = @Id;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_CaseRequest_UpdateStatus
    @Id     int,
    @Status nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @StatusId int = (SELECT TOP (1) CaseStatusId FROM dbo.CaseStatuses WHERE CaseStatusName = @Status);
    IF @StatusId IS NULL
    BEGIN
        INSERT dbo.CaseStatuses (CaseStatusName) VALUES (@Status);
        SET @StatusId = CAST(SCOPE_IDENTITY() AS int);
    END

    DECLARE @Rows int;

    UPDATE dbo.CaseInfos SET CaseStatusId = @StatusId WHERE CaseInfoId = @Id;

    SET @Rows = @@ROWCOUNT;
    SELECT @Rows AS [Value];
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_CaseRequest_Delete
    @Id int
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.CaseInfos WHERE CaseInfoId = @Id)
    BEGIN
        SELECT 0 AS [Value];
        RETURN;
    END

    -- real donation history must be kept: the caller should cancel the request instead
    IF EXISTS (SELECT 1 FROM dbo.BloodDonations WHERE CaseInfoId = @Id)
    BEGIN
        SELECT -1 AS [Value];
        RETURN;
    END

    BEGIN TRAN;
        DELETE dbo.Notifications WHERE CaseInfoId = @Id;
        DELETE dbo.CaseInfos     WHERE CaseInfoId = @Id;
    COMMIT;

    SELECT 1 AS [Value];
END
GO

/* ============================ BLOOD DONORS ======================================== */

CREATE OR ALTER PROCEDURE dbo.usp_BloodDonor_Search
    @BloodGroup      nvarchar(10)  = NULL,
    @District        nvarchar(100) = NULL,
    @Area            nvarchar(100) = NULL,
    @AvailableOnly   bit           = 0,
    @AvailableStatus nvarchar(50)  = N'Available',
    @IntervalDays    int           = 100
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Cutoff date = DATEADD(DAY, -@IntervalDays, CAST(GETDATE() AS date));
    SELECT BloodDonorId, PersonId, FirstName, LastName, FullName, DateOfBirth, ContactNo, District, City, Area, BloodGroup,
           LastDonationDate, LastDonationType, [Status], TotalDonation, DonationFromJbf, PreferredLocation, PreferredTime, Remarks
    FROM dbo.vwBloodDonors
    WHERE (@BloodGroup IS NULL OR BloodGroup = @BloodGroup)
      AND (@District   IS NULL OR District   = @District)
      AND (@Area       IS NULL OR Area       = @Area)
      AND (@AvailableOnly = 0
           OR ([Status] = @AvailableStatus
               AND (LastDonationDate IS NULL OR LastDonationDate <= @Cutoff)))
    ORDER BY District, Area, FullName
    OPTION (RECOMPILE);
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_BloodDonor_GetById
    @Id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT BloodDonorId, PersonId, FirstName, LastName, FullName, DateOfBirth, ContactNo, District, City, Area, BloodGroup,
           LastDonationDate, LastDonationType, [Status], TotalDonation, DonationFromJbf, PreferredLocation, PreferredTime, Remarks
    FROM dbo.vwBloodDonors
    WHERE BloodDonorId = @Id;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_BloodDonor_GetByUserId
    @UserId nvarchar(450)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT BloodDonorId, PersonId, FirstName, LastName, FullName, DateOfBirth, ContactNo, District, City, Area, BloodGroup,
           LastDonationDate, LastDonationType, [Status], TotalDonation, DonationFromJbf,
           PreferredLocation, PreferredTime, Remarks
    FROM dbo.vwBloodDonors
    WHERE ApplicationUserId = @UserId;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_BloodDonor_Delete
    @Id int
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.BloodDonors WHERE BloodDonorId = @Id)
    BEGIN
        SELECT 0 AS [Value];
        RETURN;
    END

    -- donation history must be kept: mark the donor Unavailable instead
    IF EXISTS (SELECT 1 FROM dbo.BloodDonations WHERE BloodDonorId = @Id)
    BEGIN
        SELECT -1 AS [Value];
        RETURN;
    END

    DELETE dbo.BloodDonors WHERE BloodDonorId = @Id;

    SELECT 1 AS [Value];
END
GO

/* ============================ NOTIFICATIONS ======================================= */

/* @UserIds = comma separated ApplicationUser ids */
CREATE OR ALTER PROCEDURE dbo.usp_Notification_CreateForUsers
    @UserIds    nvarchar(max),
    @Title      nvarchar(200),
    @Message    nvarchar(1000),
    @Type       nvarchar(50),
    @CaseInfoId int = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Rows int;

    INSERT dbo.Notifications (UserId, Title, [Message], [Type], CaseInfoId, IsRead, CreatedAtUtc)
    SELECT DISTINCT LTRIM(RTRIM(s.[value])), @Title, @Message, @Type, @CaseInfoId, 0, SYSUTCDATETIME()
    FROM STRING_SPLIT(@UserIds, N',') s
    WHERE LTRIM(RTRIM(s.[value])) <> N'';

    SET @Rows = @@ROWCOUNT;
    SELECT @Rows AS [Value];
END
GO

/* @Roles = comma separated role names, e.g. N'Admin,Member'. One notification per distinct user. */
CREATE OR ALTER PROCEDURE dbo.usp_Notification_NotifyRoles
    @Roles         nvarchar(max),
    @ExcludeUserId nvarchar(450) = NULL,
    @Title         nvarchar(200),
    @Message       nvarchar(1000),
    @Type          nvarchar(50),
    @CaseInfoId    int = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Rows int;

    INSERT dbo.Notifications (UserId, Title, [Message], [Type], CaseInfoId, IsRead, CreatedAtUtc)
    SELECT DISTINCT u.Id, @Title, @Message, @Type, @CaseInfoId, 0, SYSUTCDATETIME()
    FROM dbo.AspNetUsers     u
    JOIN dbo.AspNetUserRoles ur ON ur.UserId = u.Id
    JOIN dbo.AspNetRoles     r  ON r.Id      = ur.RoleId
    WHERE r.[Name] IN (SELECT LTRIM(RTRIM(s.[value])) FROM STRING_SPLIT(@Roles, N',') s)
      AND (@ExcludeUserId IS NULL OR u.Id <> @ExcludeUserId);

    SET @Rows = @@ROWCOUNT;
    SELECT @Rows AS [Value];
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Notification_GetForUser
    @UserId     nvarchar(450),
    @UnreadOnly bit = 0,
    @Take       int = 50
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@Take)
           NotificationId AS Id, Title, [Message], [Type], CaseInfoId, IsRead, CreatedAtUtc
    FROM dbo.Notifications
    WHERE UserId = @UserId
      AND (@UnreadOnly = 0 OR IsRead = 0)
    ORDER BY CreatedAtUtc DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Notification_GetUnreadCount
    @UserId nvarchar(450)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*) AS [Value]
    FROM dbo.Notifications
    WHERE UserId = @UserId AND IsRead = 0;
END
GO

/* the UserId filter guarantees users can only touch their own notifications */
CREATE OR ALTER PROCEDURE dbo.usp_Notification_MarkAsRead
    @Id     int,
    @UserId nvarchar(450)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Rows int;

    UPDATE dbo.Notifications SET IsRead = 1
    WHERE NotificationId = @Id AND UserId = @UserId;

    SET @Rows = @@ROWCOUNT;
    SELECT @Rows AS [Value];
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Notification_MarkAllAsRead
    @UserId nvarchar(450)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Rows int;

    UPDATE dbo.Notifications SET IsRead = 1
    WHERE UserId = @UserId AND IsRead = 0;

    SET @Rows = @@ROWCOUNT;
    SELECT @Rows AS [Value];
END
GO
