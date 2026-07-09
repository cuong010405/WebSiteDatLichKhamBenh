-- ============================================
-- Migration: Create Position table for MintCare
-- Database: SQL Server
-- ============================================

CREATE TABLE [dbo].[Position] (
    [Id]          NVARCHAR(50)   NOT NULL,
    [Name]        NVARCHAR(200)  NOT NULL,
    [Description] NVARCHAR(MAX)  NULL,
    [Active]      BIT            NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Position] PRIMARY KEY CLUSTERED ([Id] ASC)
);

-- Seed default positions
INSERT INTO [dbo].[Position] ([Id], [Name], [Description], [Active]) VALUES
('pos-001', N'Bác sĩ Chuyên khoa', N'Bác sĩ chuyên khoa nội/ngoại', 1),
('pos-002', N'Y tá Điều dưỡng', N'Y tá điều dưỡng chăm sóc tại nhà', 1),
('pos-003', N'Chuyên gia VLTL', N'Chuyên gia vật lý trị liệu', 1),
('pos-004', N'Chuyên gia Dinh dưỡng', N'Chuyên gia tư vấn dinh dưỡng', 1),
('pos-005', N'Kỹ thuật viên Xét nghiệm', N'Kỹ thuật viên xét nghiệm tại nhà', 1),
('pos-006', N'Hộ sinh', N'Hộ sinh chăm sóc sản phụ', 1);

PRINT N'Position table created and seeded successfully.';
