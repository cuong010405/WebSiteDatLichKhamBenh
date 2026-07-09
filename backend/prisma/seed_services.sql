-- ============================================
-- Seed data for Service table
-- Database: DatLichKhamDB
-- Chạy trực tiếp trong SSMS, KHÔNG cần tạo bảng
-- ============================================

-- Xóa dữ liệu cũ (nếu có)
DELETE FROM [dbo].[Service];

-- Thêm dữ liệu dịch vụ hiện tại
INSERT INTO [dbo].[Service] ([Id], [Name], [Description], [Price], [Duration], [Type], [Active]) VALUES
('svc-001', N'Kiểm tra sức khỏe định kỳ', N'Kiểm tra tổng quát và đo sinh hiệu tại nhà', 200000, N'1h', N'Clinical', 1),
('svc-002', N'Vật lý trị liệu', N'Điều trị vật lý phục hồi cơ xương khớp', 500000, N'1.5h', N'Rehab', 1),
('svc-003', N'Phục hồi chức năng', N'Hỗ trợ phục hồi chức năng sau phẫu thuật', 500000, N'1.5h', N'Rehab', 1),
('svc-004', N'Truyền dịch tại nhà', N'Truyền dịch y tế an toàn tại nhà', 400000, N'1h', N'Clinical', 1),
('svc-005', N'Chăm sóc vết thương', N'Vệ sinh và băng bó vết thương chuyên nghiệp', 350000, N'1h', N'Clinical', 1),
('svc-006', N'Khám nội khoa', N'Khám và tư vấn bệnh lý nội khoa', 300000, N'1h', N'Clinical', 1),
('svc-007', N'Tư vấn dinh dưỡng', N'Tư vấn chế độ dinh dưỡng cá nhân hóa', 300000, N'1h', N'Nutrition', 1);

-- Kiểm tra kết quả
SELECT * FROM [dbo].[Service];
PRINT N'Seed data imported successfully!';
