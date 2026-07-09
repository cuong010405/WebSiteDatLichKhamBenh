-- ============================================
-- Migration: Create Department table for MintCare
-- Database: SQL Server
-- ============================================

CREATE TABLE [dbo].[Department] (
    [Id]          NVARCHAR(50)   NOT NULL,
    [Name]        NVARCHAR(200)  NOT NULL,
    [Description] NVARCHAR(MAX)  NULL,
    [Active]      BIT            NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Department] PRIMARY KEY CLUSTERED ([Id] ASC)
);

-- Seed default departments
INSERT INTO [dbo].[Department] ([Id], [Name], [Description], [Active]) VALUES
('dept-001', N'Nội khoa', N'Chuyên khoa nội tổng hợp', 1),
('dept-002', N'Ngoại khoa', N'Chuyên khoa ngoại tổng hợp', 1),
('dept-003', N'Phục hồi chức năng', N'Phục hồi chức năng sau phẫu thuật và chấn thương', 1),
('dept-004', N'Cấp cứu tại gia', N'Dịch vụ cấp cứu và chăm sóc khẩn cấp tại nhà', 1);

PRINT N'Department table created and seeded successfully.';
