import { Thermometer, Heart, Pill, ClipboardList } from "lucide-react";
import { Staff, Patient, Visit, ActivityLogEntry } from "./types";

export const staff: Staff[] = [
  {
    id: '1',
    name: 'Sandra Bullock',
    role: 'Y tá • Chăm sóc vết thương',
    status: 'Sẵn sàng',
    department: 'Nội khoa',
    phone: '090 123 4567',
    email: 'sandra@mintcare.com',
    location: 'Quận Queens',
    avatar: 'https://i.pravatar.cc/150?u=sandra',
    isNew: true,
    available: true
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    role: 'Chuyên gia VLTL • Phục hồi',
    status: 'Đang bận',
    department: 'Phục hồi chức năng',
    phone: '090 234 5678',
    email: 'marcus@mintcare.com',
    location: 'Kết thúc trong 12 phút',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    available: false
  },
  {
    id: '3',
    name: 'Lara Croft',
    role: 'Y tá • Truyền dịch',
    status: 'Sẵn sàng',
    department: 'Ngoại khoa',
    phone: '090 345 6789',
    email: 'lara@mintcare.com',
    location: 'Brooklyn',
    avatar: 'https://i.pravatar.cc/150?u=lara',
    available: true
  },
  {
    id: '4',
    name: 'Peter Parker',
    role: 'Chuyên gia dinh dưỡng',
    status: 'Sẵn sàng',
    department: 'Nội khoa',
    phone: '090 456 7890',
    email: 'peter@mintcare.com',
    location: 'Manhattan',
    avatar: 'https://i.pravatar.cc/150?u=peter',
    available: true
  }
];

export const patients: Patient[] = [
  {
    id: 'BN-0842',
    name: 'Evelyn Green',
    age: 64,
    gender: 'Nữ',
    lastVisit: '12/06/2024',
    lastVisitTime: '09:15 AM',
    status: 'Đang điều trị',
    summary: 'Bệnh nhân có tiền sử cao huyết áp và tiểu đường type 2. Hiện đang trong lộ trình phục hồi sau phẫu thuật thay khớp gối trái.',
    assignedStaff: ['1', '2']
  },
  {
    id: 'BN-0721',
    name: 'Oscar White',
    age: 72,
    gender: 'Nam',
    lastVisit: '11/06/2024',
    lastVisitTime: '02:30 PM',
    status: 'Chờ tái khám',
    summary: 'Bệnh nhân cần kiểm tra định kỳ hàng tháng về chức năng tim mạch.',
    assignedStaff: ['2']
  },
  {
    id: 'BN-1052',
    name: 'Rose Thorne',
    age: 45,
    gender: 'Nữ',
    lastVisit: '09/06/2024',
    lastVisitTime: '10:00 AM',
    status: 'Đang điều trị',
    summary: 'Đang điều trị liệu pháp truyền dịch tại gia.',
    assignedStaff: ['3']
  }
];

export const visits: Visit[] = [
  {
    id: '1',
    type: 'Kiểm tra sức khỏe',
    patientId: 'BN-0842',
    patientName: 'Evelyn Green',
    staffId: '1',
    time: '08:00 - 09:00',
    startTime: '08:00',
    endTime: '09:00',
    duration: '1h',
    status: 'Đang thực hiện',
    icon: Thermometer
  },
  {
    id: '2',
    type: 'Vật lý trị liệu',
    patientId: 'BN-0721',
    patientName: 'Oscar White',
    staffId: '2',
    time: '09:00 - 10:30',
    startTime: '09:00',
    endTime: '10:30',
    duration: '1.5h',
    status: 'Đã xác nhận',
    icon: Heart
  },
  {
    id: '3',
    type: 'Truyền dịch y tế',
    patientId: 'BN-1052',
    patientName: 'Rose Thorne',
    staffId: '3',
    time: '10:00 - 11:00',
    startTime: '10:00',
    endTime: '11:00',
    duration: '1h',
    status: 'Đã xác nhận',
    icon: Pill
  },
  {
    id: '4',
    type: 'Tư vấn dinh dưỡng',
    patientId: 'BN-0842',
    patientName: 'Arthur D.',
    staffId: '4',
    time: '16:00 - 17:00',
    startTime: '16:00',
    endTime: '17:00',
    duration: '1h',
    status: 'Đã xác nhận',
    icon: ClipboardList
  }
];

export const logs: ActivityLogEntry[] = [
  { id: '1', status: "completed", title: "Ca trực hoàn tất", desc: "Sandra B. đã hoàn tất thăm khám tại Quận Queens", time: "14:22 PM", color: "bg-primary" },
  { id: '2', status: "assigned", title: "Đã phân công tự động", desc: "Đã phân công VLTL cho Arthur D. vào ngày mai", time: "13:50 PM", color: "bg-on-surface-tertiary" },
  { id: '3', status: "review", title: "Đánh giá mới", desc: "Bệnh nhân Oscar W. đã đánh giá 5/5", time: "12:05 PM", color: "bg-hairline" },
];

export const reportData = {
  patientInflow: [
    { label: 'T2', value: 65 },
    { label: 'T3', value: 78 },
    { label: 'T4', value: 72 },
    { label: 'T5', value: 90 },
    { label: 'T6', value: 85 },
    { label: 'T7', value: 95 },
    { label: 'CN', value: 102 },
  ],
  bedOccupancy: 82,
  staffHours: [
    { label: 'Thứ 2', value: 420 },
    { label: 'Thứ 3', value: 380 },
    { label: 'Thứ 4', value: 450 },
    { label: 'Thứ 5', value: 410 },
    { label: 'Thứ 6', value: 390 },
  ]
};
