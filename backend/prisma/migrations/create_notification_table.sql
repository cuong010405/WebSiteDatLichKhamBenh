-- =====================================================
-- Tạo bảng Notification để lưu thông báo từ khách hàng
-- Chạy script này trong SQL Server Management Studio
-- =====================================================

IF NOT EXISTS (
  SELECT * FROM sys.objects
  WHERE object_id = OBJECT_ID(N'[dbo].[Notification]')
  AND type in (N'U')
)
BEGIN
  CREATE TABLE [dbo].[Notification] (
    [Id]        NVARCHAR(50)  NOT NULL,
    [UserId]    NVARCHAR(50)  NULL,
    [VisitId]   NVARCHAR(50)  NULL,
    [Type]      NVARCHAR(100) NOT NULL,
    [Title]     NVARCHAR(300) NOT NULL,
    [Message]   NVARCHAR(MAX) NOT NULL,
    [IsRead]    BIT           NOT NULL DEFAULT 0,
    [CreatedAt] DATETIME      NOT NULL DEFAULT GETDATE(),

    CONSTRAINT [PK_Notification] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Notification_User]
      FOREIGN KEY ([UserId]) REFERENCES [dbo].[User]([Id])
      ON UPDATE NO ACTION ON DELETE NO ACTION
  );

  PRINT 'Bảng Notification đã được tạo thành công!';
END
ELSE
BEGIN
  PRINT 'Bảng Notification đã tồn tại, bỏ qua.';
END;

-- Tạo index để truy vấn nhanh theo UserId và CreatedAt
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notification_UserId' AND object_id = OBJECT_ID('[dbo].[Notification]'))
BEGIN
  CREATE INDEX [IX_Notification_UserId] ON [dbo].[Notification] ([UserId]);
  PRINT 'Index IX_Notification_UserId đã được tạo.';
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notification_CreatedAt' AND object_id = OBJECT_ID('[dbo].[Notification]'))
BEGIN
  CREATE INDEX [IX_Notification_CreatedAt] ON [dbo].[Notification] ([CreatedAt] DESC);
  PRINT 'Index IX_Notification_CreatedAt đã được tạo.';
END;

GO
