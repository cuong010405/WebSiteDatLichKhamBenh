import { z } from "zod";

export const staffSchema = z.object({
  id: z.string().min(1, "ID nhân viên là bắt buộc"),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  role: z.string().min(2, "Chức vụ là bắt buộc"),
  status: z.enum(["Sẵn sàng", "Đang bận", "Nghỉ phép"]).default("Sẵn sàng"),
  department: z.string().min(2, "Khoa/Phòng là bắt buộc"),
  phone: z.string().min(3, "Số điện thoại không hợp lệ").optional().default("0000000000"),
  email: z.string().email("Email không hợp lệ").or(z.literal("")).optional().default(""),
  location: z.string().min(1, "Địa điểm là bắt buộc").optional().default("Van phong chinh"),
  avatar: z.string().url().or(z.string().or(z.literal(""))).optional(),
  available: z.boolean().default(true),
  isNew: z.boolean().optional().default(false),
});

export const patientSchema = z.object({
  id: z.string().min(1, "Mã bệnh nhân là bắt buộc"),
  name: z.string().min(2, "Tên bệnh nhân phải có ít nhất 2 ký tự"),
  age: z.number().int().min(0, "Tuổi không hợp lệ"),
  gender: z.enum(["Nam", "Nữ"]),
  lastVisit: z.string().min(1, "Ngày khám gần nhất là bắt buộc"),
  lastVisitTime: z.string().min(1, "Giờ khám gần nhất là bắt buộc"),
  status: z.enum(["Đang điều trị", "Chờ tái khám", "Đã xuất viện"]).default("Đang điều trị"),
  summary: z.string().optional().default(""),
  assignedStaff: z.array(z.string()).optional().default([]),
});

export const visitSchema = z.object({
  id: z.string().min(1, "Mã lịch khám là bắt buộc"),
  type: z.string().min(2, "Loại khám bệnh là bắt buộc"),
  patientId: z.string().min(1, "Mã bệnh nhân là bắt buộc"),
  staffId: z.string().min(1, "Mã nhân viên là bắt buộc"),
  time: z.string().min(1, "Thời gian khám là bắt buộc"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.string().min(1, "Thời lượng khám là bắt buộc"),
  status: z.enum(["Đang thực hiện", "Đã xác nhận", "Đã hoàn tất", "Đã hủy", "Chờ duyệt"]).default("Chờ duyệt"),
});

export const activityLogSchema = z.object({
  id: z.string().min(1, "Mã log là bắt buộc"),
  status: z.enum(["completed", "assigned", "review"]),
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  desc: z.string().min(1, "Mô tả là bắt buộc"),
  time: z.string().min(1, "Thời gian là bắt buộc"),
  color: z.string().min(1, "Màu sắc là bắt buộc"),
});
