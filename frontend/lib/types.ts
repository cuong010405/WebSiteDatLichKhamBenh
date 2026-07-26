import type { ElementType } from "react";

export type StaffStatus = "Sẵn sàng" | "Đang bận" | "Nghỉ phép";
export type PatientStatus =
  | "Đang điều trị"
  | "Chờ tái khám"
  | "Đã xuất viện"
  | "Chờ duyệt";
export type VisitStatus =
  | "Đang thực hiện"
  | "Đã xác nhận"
  | "Đã hoàn tất"
  | "Đã hủy"
  | "Chờ duyệt";

export interface StaffLicense {
  id: string;
  staffId: string;
  licenseNumber: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string | null;
  specialty?: string | null;
  note?: string | null;
}

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
  experience?: string | null;
  specialty?: string | null;
  licenses?: StaffLicense[];
}

export interface CareLog {
  id: string;
  patientId: string;
  staffId?: string | null;
  staffName?: string | null;
  serviceName?: string | null;
  careDate: string;
  temperature?: string | null;
  bloodPressure?: string | null;
  heartRate?: string | null;
  spo2?: string | null;
  bloodSugar?: string | null;
  medications?: string | null;
  notes?: string | null;
  assessment?: string | null;
  attachment?: string | null;
  createdAt?: string | Date;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Nam" | "Nữ" | "Khác";
  lastVisit: string;
  lastVisitTime: string;
  status: PatientStatus;
  summary: string;
  assignedStaff: string[]; // staff IDs
}

export interface Visit {
  id: string;
  type: string;
  patientId?: string | null;
  patientName?: string | null;
  staffId: string;
  staffName?: string | null;
  userId?: string | null;
  userName?: string | null;
  userPhone?: string | null;
  userEmail?: string | null;
  userAge?: number | null;
  userGender?: string | null;
  address?: string | null;
  notes?: string | null;
  date?: string | null;
  time: string;
  startTime?: string | null;
  endTime?: string | null;
  duration: string;
  status: VisitStatus;
  paymentMethod?: string | null;
  paymentAmount?: string | null;
  paymentNote?: string | null;
  paymentStatus?: string | null;
  icon?: ElementType;
  // Dispatch / booking fields
  careMode?: string | null;
  packagePlan?: string | null;
  packageShift?: string | null;
  customerArea?: string | null;
  requiredSpecialty?: string | null;
  assignedAt?: string | null;
  phone?: string | null;
  email?: string | null;
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
