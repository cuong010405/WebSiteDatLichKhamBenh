-- ============================================================
-- MintCare Database Setup Script
-- Run this in SQL Server Management Studio (SSMS) as sa or
-- any sysadmin account, connected to the MSSQLSERVER instance
-- ============================================================

-- Step 1: Create the database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'DatLichKhamDB')
BEGIN
    CREATE DATABASE DatLichKhamDB;
    PRINT 'Database DatLichKhamDB created.';
END
ELSE
BEGIN
    PRINT 'Database DatLichKhamDB already exists.';
END
GO

-- Step 2: Enable SQL Server Authentication mode (if not already)
-- (Requires restart of SQL Server if changed)
EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE',
    N'Software\Microsoft\MSSQLServer\MSSQLServer',
    N'LoginMode', REG_DWORD, 2;
GO

-- Step 3: Create the 'prisma' login
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'prisma')
BEGIN
    CREATE LOGIN prisma WITH PASSWORD = 'Prisma123',
        CHECK_POLICY = OFF,
        CHECK_EXPIRATION = OFF;
    PRINT 'Login prisma created.';
END
ELSE
BEGIN
    -- Update password in case it changed
    ALTER LOGIN prisma WITH PASSWORD = 'Prisma123';
    PRINT 'Login prisma already exists (password refreshed).';
END
GO

-- Step 4: Create user in the database and grant permissions
USE DatLichKhamDB;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'prisma')
BEGIN
    CREATE USER prisma FOR LOGIN prisma;
    PRINT 'User prisma created in DatLichKhamDB.';
END
GO

-- Grant full control to prisma user
ALTER ROLE db_owner ADD MEMBER prisma;
PRINT 'Granted db_owner role to prisma.';
GO

PRINT '=== Setup complete! ==='
PRINT 'Now run: cd backend && npm run db:push'
GO
