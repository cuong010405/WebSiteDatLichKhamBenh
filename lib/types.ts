import type { ElementType } from "react";

export type StaffStatus = "Sẵn sàng" | "Đang bận" | "Nghỉ phép";
export type PatientStatus = "Đang điều trị" | "Chờ tái khám" | "Đã xuất viện";
export type VisitStatus = "Đang thực hiện" | "Đã xác nhận" | "Đã hoàn tất" | "Đã hủy" | "Chờ duyệt";

export interface Staff {
  id: string;
  name: string;
  role: string;
  status: StaffStatus;
  department: string;
  phone: string;
  email: string;
  location: string;
  avatar: string;
  available: boolean;
  isNew?: boolean;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Nam" | "Nữ";
  lastVisit: string;
  lastVisitTime: string;
  status: PatientStatus;
  summary: string;
  assignedStaff: string[]; // staff IDs
}

export interface Visit {
  id: string;
  type: string;
  patientId: string;
  patientName: string;
  staffId: string;
  time: string;
  startTime?: string;
  endTime?: string;
  duration: string; // e.g. "12m", "1h"
  status: VisitStatus;
  icon?: ElementType;
}

export interface ActivityLogEntry {
  id: string;
  status: "completed" | "assigned" | "review";
  title: string;
  desc: string;
  time: string;
  color: string;
}

export interface ReportData {
  patientInflow: { label: string; value: number }[];
  bedOccupancy: number;
  staffHours: { label: string; value: number }[];
}
