-- ============================================
-- Migration: Create Role table for MintCare
-- Database: SQL Server
-- ============================================

CREATE TABLE [dbo].[Role] (
    [Id]          NVARCHAR(50)   NOT NULL,
    [Name]        NVARCHAR(200)  NOT NULL,
    [Description] NVARCHAR(MAX)  NULL,
    [Active]      BIT            NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Role] PRIMARY KEY CLUSTERED ([Id] ASC)
);

-- Seed default roles
INSERT INTO [dbo].[Role] ([Id], [Name], [Description], [Active]) VALUES
('role-001', N'Bác sĩ Chuyên khoa', N'Bác sĩ chuyên khoa nội/ngoại', 1),
('role-002', N'Y tá Điều dưỡng', N'Y tá điều dưỡng chăm sóc tại nhà', 1),
('role-003', N'Chuyên gia VLTL', N'Chuyên gia vật lý trị liệu', 1),
('role-004', N'Chuyên gia Dinh dưỡng', N'Chuyên gia tư vấn dinh dưỡng', 1);

PRINT N'Role table created and seeded successfully.';
