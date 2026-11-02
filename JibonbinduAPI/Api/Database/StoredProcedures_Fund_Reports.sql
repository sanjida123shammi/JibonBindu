/* =====================================================================================
   Blood Donation Foundation - fund deposits, fund costings, fund lookups, aggregate reports
   Run AFTER "dotnet ef database update" and AFTER StoredProcedures.sql. Safe to re-run.
   Requires SQL Server 2016 SP1+.

   Conventions (same as StoredProcedures.sql)
   - SELECT procedures return columns named exactly like the C# DTO properties.
   - Write procedures return ONE row with ONE column [Value]:
       delete -> 1 deleted, 0 not found
   - Create and Update of deposits/costings are NOT here on purpose: they run through EF Core.
   ===================================================================================== */

/* ------------------------------- VIEWS ------------------------------------------- */
GO
CREATE OR ALTER VIEW dbo.vwFundDeposits
AS
SELECT  fd.FundDepositId                    AS FundDepositId,
        fd.FundDonationDate                 AS FundDonationDate,
        fd.FundDonationTypeId               AS FundDonationTypeId,
        dt.DonationTypeName                 AS DonationTypeName,
        fd.FundDonorId                      AS FundDonorId,
        p.FirstName + N' ' + p.LastName     AS DonorName,
        p.ContactNumber                     AS DonorContactNo,
        fdn.DonationSlot                    AS DonationSlot,
        fd.Amount                           AS Amount,
        fd.FundReceiver                     AS FundReceiver,
        fd.FundingTypeId                    AS FundingTypeId,
        ft.FundingTypeName                  AS FundingTypeName,
        fd.CashTypeId                       AS CashTypeId,
        ct.CashTypeName                     AS CashTypeName,
        fd.Months                           AS Months
FROM dbo.FundDeposits fd
JOIN dbo.FundDonationTypes dt  ON dt.FundDonationTypeId = fd.FundDonationTypeId
JOIN dbo.FundDonors        fdn ON fdn.FundDonorId       = fd.FundDonorId
JOIN dbo.Persons           p   ON p.PersonId            = fdn.PersonId
JOIN dbo.FundingTypes      ft  ON ft.FundingTypeId      = fd.FundingTypeId
JOIN dbo.CashTypes         ct  ON ct.CashTypeId         = fd.CashTypeId;
GO

CREATE OR ALTER VIEW dbo.vwFundCostings
AS
SELECT  dc.DailyCostId                      AS FundCostingId,
        dc.CostingDate                      AS CostingDate,
        dc.SpentByPersonId                  AS SpentByPersonId,
        p.FirstName + N' ' + p.LastName     AS SpentByName,
        dc.CostAmount                       AS CostAmount,
        dc.Purpose                          AS Purpose,
        dc.SettlementStatusId               AS SettlementStatusId,
        ss.SettlementStatusTitle            AS SettlementStatusTitle,
        dc.Remarks                          AS Remarks
FROM dbo.DailyCosts dc
JOIN dbo.Persons            p  ON p.PersonId            = dc.SpentByPersonId
JOIN dbo.SettlementStatuses ss ON ss.SettlementStatusId = dc.SettlementStatusId;
GO

/* =========================== FUND DEPOSITS ======================================== */

CREATE OR ALTER PROCEDURE dbo.usp_FundDeposit_GetById
    @Id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT FundDepositId, FundDonationDate, FundDonationTypeId, DonationTypeName, FundDonorId, DonorName,
           DonorContactNo, DonationSlot, Amount, FundReceiver, FundingTypeId, FundingTypeName,
           CashTypeId, CashTypeName, Months
    FROM dbo.vwFundDeposits
    WHERE FundDepositId = @Id;
END
GO

/* Every filter is optional (NULL = do not filter). @ToDate is inclusive. Newest first, paged. */
CREATE OR ALTER PROCEDURE dbo.usp_FundDeposit_Search
    @FromDate           datetime2(7) = NULL,
    @ToDate             datetime2(7) = NULL,
    @FundDonorId        int = NULL,
    @FundDonationTypeId int = NULL,
    @FundingTypeId      int = NULL,
    @CashTypeId         int = NULL,
    @Page               int = 1,
    @PageSize           int = 50
AS
BEGIN
    SET NOCOUNT ON;

    SET @Page     = CASE WHEN @Page < 1 THEN 1 ELSE @Page END;
    SET @PageSize = CASE WHEN @PageSize < 1 THEN 50 WHEN @PageSize > 200 THEN 200 ELSE @PageSize END;

    DECLARE @From datetime2(7) = CAST(CAST(@FromDate AS date) AS datetime2(7));
    DECLARE @ToExclusive datetime2(7) = DATEADD(DAY, 1, CAST(CAST(@ToDate AS date) AS datetime2(7)));

    SELECT FundDepositId, FundDonationDate, FundDonationTypeId, DonationTypeName, FundDonorId, DonorName,
           DonorContactNo, DonationSlot, Amount, FundReceiver, FundingTypeId, FundingTypeName,
           CashTypeId, CashTypeName, Months
    FROM dbo.vwFundDeposits
    WHERE (@FromDate           IS NULL OR FundDonationDate >= @From)
      AND (@ToDate             IS NULL OR FundDonationDate <  @ToExclusive)
      AND (@FundDonorId        IS NULL OR FundDonorId        = @FundDonorId)
      AND (@FundDonationTypeId IS NULL OR FundDonationTypeId = @FundDonationTypeId)
      AND (@FundingTypeId      IS NULL OR FundingTypeId      = @FundingTypeId)
      AND (@CashTypeId         IS NULL OR CashTypeId         = @CashTypeId)
    ORDER BY FundDonationDate DESC, FundDepositId DESC
    OFFSET (@Page - 1) * @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY
    OPTION (RECOMPILE);
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_FundDeposit_Delete
    @Id int
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Rows int;

    DELETE dbo.FundDeposits WHERE FundDepositId = @Id;

    SET @Rows = @@ROWCOUNT;
    SELECT @Rows AS [Value];
END
GO

/* =========================== FUND COSTINGS ======================================== */

CREATE OR ALTER PROCEDURE dbo.usp_FundCosting_GetById
    @Id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT FundCostingId, CostingDate, SpentByPersonId, SpentByName, CostAmount, Purpose,
           SettlementStatusId, SettlementStatusTitle, Remarks
    FROM dbo.vwFundCostings
    WHERE FundCostingId = @Id;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_FundCosting_Search
    @FromDate           datetime2(7) = NULL,
    @ToDate             datetime2(7) = NULL,
    @SpentByPersonId    int = NULL,
    @SettlementStatusId int = NULL,
    @Page               int = 1,
    @PageSize           int = 50
AS
BEGIN
    SET NOCOUNT ON;

    SET @Page     = CASE WHEN @Page < 1 THEN 1 ELSE @Page END;
    SET @PageSize = CASE WHEN @PageSize < 1 THEN 50 WHEN @PageSize > 200 THEN 200 ELSE @PageSize END;

    DECLARE @From datetime2(7) = CAST(CAST(@FromDate AS date) AS datetime2(7));
    DECLARE @ToExclusive datetime2(7) = DATEADD(DAY, 1, CAST(CAST(@ToDate AS date) AS datetime2(7)));

    SELECT FundCostingId, CostingDate, SpentByPersonId, SpentByName, CostAmount, Purpose,
           SettlementStatusId, SettlementStatusTitle, Remarks
    FROM dbo.vwFundCostings
    WHERE (@FromDate           IS NULL OR CostingDate >= @From)
      AND (@ToDate             IS NULL OR CostingDate <  @ToExclusive)
      AND (@SpentByPersonId    IS NULL OR SpentByPersonId    = @SpentByPersonId)
      AND (@SettlementStatusId IS NULL OR SettlementStatusId = @SettlementStatusId)
    ORDER BY CostingDate DESC, FundCostingId DESC
    OFFSET (@Page - 1) * @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY
    OPTION (RECOMPILE);
END
GO

/* 1 = updated, 0 = costing not found, -1 = settlement status does not exist */
CREATE OR ALTER PROCEDURE dbo.usp_FundCosting_UpdateSettlementStatus
    @Id                 int,
    @SettlementStatusId int
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.DailyCosts WHERE DailyCostId = @Id)
    BEGIN
        SELECT 0 AS [Value];
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.SettlementStatuses WHERE SettlementStatusId = @SettlementStatusId)
    BEGIN
        SELECT -1 AS [Value];
        RETURN;
    END

    UPDATE dbo.DailyCosts SET SettlementStatusId = @SettlementStatusId WHERE DailyCostId = @Id;

    SELECT 1 AS [Value];
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_FundCosting_Delete
    @Id int
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Rows int;

    DELETE dbo.DailyCosts WHERE DailyCostId = @Id;

    SET @Rows = @@ROWCOUNT;
    SELECT @Rows AS [Value];
END
GO

/* ============================ FUND LOOKUPS ======================================== */

/* The Kind strings must match SharedLibrary.Constants.FundLookupKinds. */
CREATE OR ALTER PROCEDURE dbo.usp_FundLookup_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Kind, Id, [Name]
    FROM (
        SELECT N'donation-types' AS Kind, FundDonationTypeId AS Id, DonationTypeName     AS [Name] FROM dbo.FundDonationTypes
        UNION ALL
        SELECT N'funding-types',          FundingTypeId,            FundingTypeName               FROM dbo.FundingTypes
        UNION ALL
        SELECT N'cash-types',             CashTypeId,               CashTypeName                  FROM dbo.CashTypes
        UNION ALL
        SELECT N'donor-types',            FundDonorTypeId,          FundDonorTypeName             FROM dbo.FundDonorTypes
        UNION ALL
        SELECT N'settlement-statuses',    SettlementStatusId,       SettlementStatusTitle         FROM dbo.SettlementStatuses
    ) x
    ORDER BY Kind, [Name];
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_FundDonor_GetOptions
    @Search nvarchar(100) = NULL,
    @Take   int = 100
AS
BEGIN
    SET NOCOUNT ON;

    -- escape LIKE wildcards typed by the user
    DECLARE @Pattern nvarchar(220) = N'%' +
        REPLACE(REPLACE(REPLACE(@Search, N'[', N'[[]'), N'%', N'[%]'), N'_', N'[_]') + N'%';

    SELECT TOP (@Take)
           fdn.FundDonorId                   AS FundDonorId,
           fdn.PersonId                      AS PersonId,
           p.FirstName + N' ' + p.LastName   AS FullName,
           p.ContactNumber                   AS ContactNo,
           fdt.FundDonorTypeName             AS DonorType,
           fdn.DonationSlot                  AS DonationSlot,
           fdn.PayAmount                     AS PayAmount
    FROM dbo.FundDonors fdn
    JOIN dbo.Persons        p   ON p.PersonId         = fdn.PersonId
    JOIN dbo.FundDonorTypes fdt ON fdt.FundDonorTypeId = fdn.FundDonorTypeId
    WHERE @Search IS NULL
       OR (p.FirstName + N' ' + p.LastName) LIKE @Pattern
       OR p.ContactNumber LIKE @Pattern
       OR fdn.DonationSlot LIKE @Pattern
    ORDER BY FullName
    OPTION (RECOMPILE);
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Person_GetOptions
    @Search nvarchar(100) = NULL,
    @Take   int = 50
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Pattern nvarchar(220) = N'%' +
        REPLACE(REPLACE(REPLACE(@Search, N'[', N'[[]'), N'%', N'[%]'), N'_', N'[_]') + N'%';

    SELECT TOP (@Take)
           p.PersonId                        AS PersonId,
           p.FirstName + N' ' + p.LastName   AS FullName,
           p.ContactNumber                   AS ContactNo,
           pr.PersonRoleName                 AS [Role]
    FROM dbo.Persons p
    JOIN dbo.PersonRoles pr ON pr.PersonRoleId = p.PersonRoleId
    WHERE @Search IS NULL
       OR (p.FirstName + N' ' + p.LastName) LIKE @Pattern
       OR p.ContactNumber LIKE @Pattern
    ORDER BY FullName
    OPTION (RECOMPILE);
END
GO

/* ===================== AGGREGATE: BLOOD DONATIONS ================================= */
/* One BloodDonations row = one donation. @To is inclusive. NULL = no limit. */

/* Total per individual blood group. All groups are listed, even with 0 donations. */
CREATE OR ALTER PROCEDURE dbo.usp_BloodDonationReport_ByBloodGroup
    @From datetime2(7) = NULL,
    @To   datetime2(7) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FromStart datetime2(7) = CAST(CAST(@From AS date) AS datetime2(7));
    DECLARE @ToEnd     datetime2(7) = DATEADD(DAY, 1, CAST(CAST(@To AS date) AS datetime2(7)));

    SELECT bg.BloodGroupId                    AS BloodGroupId,
           bg.GroupName                       AS BloodGroup,
           COUNT(d.BloodDonationId)           AS TotalDonations,
           COUNT(DISTINCT d.BloodDonorId)     AS DistinctDonors
    FROM dbo.BloodGroups bg
    LEFT JOIN dbo.BloodDonations d
           ON d.BloodGroupId = bg.BloodGroupId
          AND (@From IS NULL OR d.DonationDate >= @FromStart)
          AND (@To   IS NULL OR d.DonationDate <  @ToEnd)
    GROUP BY bg.BloodGroupId, bg.GroupName
    ORDER BY bg.BloodGroupId;
END
GO

/* Total of all blood donations (always exactly one row). */
CREATE OR ALTER PROCEDURE dbo.usp_BloodDonationReport_Total
    @From datetime2(7) = NULL,
    @To   datetime2(7) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FromStart datetime2(7) = CAST(CAST(@From AS date) AS datetime2(7));
    DECLARE @ToEnd     datetime2(7) = DATEADD(DAY, 1, CAST(CAST(@To AS date) AS datetime2(7)));

    SELECT COUNT(d.BloodDonationId)       AS TotalDonations,
           COUNT(DISTINCT d.BloodDonorId) AS DistinctDonors,
           MIN(d.DonationDate)            AS FirstDonationDate,
           MAX(d.DonationDate)            AS LastDonationDate
    FROM dbo.BloodDonations d
    WHERE (@From IS NULL OR d.DonationDate >= @FromStart)
      AND (@To   IS NULL OR d.DonationDate <  @ToEnd);
END
GO

/* Total per month. With @Year: exactly 12 rows (months without donations show 0).
   Without @Year: one row per month that has donations, across all years. */
CREATE OR ALTER PROCEDURE dbo.usp_BloodDonationReport_Monthly
    @Year int = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Year IS NULL
    BEGIN
        SELECT YEAR(d.DonationDate)           AS [Year],
               MONTH(d.DonationDate)          AS [Month],
               COUNT(d.BloodDonationId)       AS TotalDonations,
               COUNT(DISTINCT d.BloodDonorId) AS DistinctDonors
        FROM dbo.BloodDonations d
        GROUP BY YEAR(d.DonationDate), MONTH(d.DonationDate)
        ORDER BY [Year], [Month];
    END
    ELSE
    BEGIN
        ;WITH m AS (
            SELECT n AS [Month]
            FROM (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12)) v(n)
        )
        SELECT @Year          AS [Year],
               m.[Month]      AS [Month],
               x.TotalDonations,
               x.DistinctDonors
        FROM m
        OUTER APPLY (
            SELECT COUNT(d.BloodDonationId)       AS TotalDonations,
                   COUNT(DISTINCT d.BloodDonorId) AS DistinctDonors
            FROM dbo.BloodDonations d
            WHERE d.DonationDate >= DATEFROMPARTS(@Year, m.[Month], 1)
              AND d.DonationDate <  DATEADD(MONTH, 1, DATEFROMPARTS(@Year, m.[Month], 1))
        ) x
        ORDER BY m.[Month];
    END
END
GO

/* ====================== AGGREGATE: FUND DONATIONS ================================= */
/* Based on FundDeposits.FundDonationDate and FundDeposits.Amount. */

/* Total per year (only years that have deposits). */
CREATE OR ALTER PROCEDURE dbo.usp_FundDonationReport_Yearly
    @FromYear int = NULL,
    @ToYear   int = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT YEAR(fd.FundDonationDate)                       AS [Year],
           CAST(SUM(fd.Amount) AS decimal(18, 4))          AS TotalAmount,
           COUNT(fd.FundDepositId)                         AS DepositCount,
           COUNT(DISTINCT fd.FundDonorId)                  AS DistinctDonors
    FROM dbo.FundDeposits fd
    WHERE (@FromYear IS NULL OR fd.FundDonationDate >= DATEFROMPARTS(@FromYear, 1, 1))
      AND (@ToYear   IS NULL OR fd.FundDonationDate <  DATEFROMPARTS(@ToYear + 1, 1, 1))
    GROUP BY YEAR(fd.FundDonationDate)
    ORDER BY [Year];
END
GO

/* Total per month. With @Year: exactly 12 rows (empty months show 0).
   Without @Year: one row per month that has deposits, across all years. */
CREATE OR ALTER PROCEDURE dbo.usp_FundDonationReport_Monthly
    @Year int = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Year IS NULL
    BEGIN
        SELECT YEAR(fd.FundDonationDate)                AS [Year],
               MONTH(fd.FundDonationDate)               AS [Month],
               CAST(SUM(fd.Amount) AS decimal(18, 4))   AS TotalAmount,
               COUNT(fd.FundDepositId)                  AS DepositCount,
               COUNT(DISTINCT fd.FundDonorId)           AS DistinctDonors
        FROM dbo.FundDeposits fd
        GROUP BY YEAR(fd.FundDonationDate), MONTH(fd.FundDonationDate)
        ORDER BY [Year], [Month];
    END
    ELSE
    BEGIN
        ;WITH m AS (
            SELECT n AS [Month]
            FROM (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12)) v(n)
        )
        SELECT @Year     AS [Year],
               m.[Month] AS [Month],
               CAST(x.TotalAmount AS decimal(18, 4)) AS TotalAmount,
               x.DepositCount,
               x.DistinctDonors
        FROM m
        OUTER APPLY (
            SELECT COALESCE(SUM(fd.Amount), 0)   AS TotalAmount,
                   COUNT(fd.FundDepositId)       AS DepositCount,
                   COUNT(DISTINCT fd.FundDonorId) AS DistinctDonors
            FROM dbo.FundDeposits fd
            WHERE fd.FundDonationDate >= DATEFROMPARTS(@Year, m.[Month], 1)
              AND fd.FundDonationDate <  DATEADD(MONTH, 1, DATEFROMPARTS(@Year, m.[Month], 1))
        ) x
        ORDER BY m.[Month];
    END
END
GO
