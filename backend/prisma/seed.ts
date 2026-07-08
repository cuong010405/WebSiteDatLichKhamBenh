import { PrismaClient } from "@prisma/client";
import process from "process";

const prisma = new PrismaClient();

const staffData = [
  {
    id: "1",
    name: "Sandra Bullock",
    role: "Y tá • Chăm sóc vết thương",
    status: "Sẵn sàng",
    department: "Nội khoa",
    phone: "090 123 4567",
    email: "sandra@mintcare.com",
    location: "Quận Queens",
    avatar: 'https://ui-avatars.com/api/?name=Sandra+Bullock&background=6366f1&color=fff&size=150&bold=true&rounded=true',
    isNew: true,
    available: true,
  },
  {
    id: "2",
    name: "Marcus Thorne",
    role: "Chuyên gia VLTL • Phục hồi",
    status: "Đang bận",
    department: "Phục hồi chức năng",
    phone: "090 234 5678",
    email: "marcus@mintcare.com",
    location: "Kết thúc trong 12 phút",
    avatar: 'https://ui-avatars.com/api/?name=Marcus+Thorne&background=10b981&color=fff&size=150&bold=true&rounded=true',
    isNew: false,
    available: false,
  },
  {
    id: "3",
    name: "Lara Croft",
    role: "Y tá • Truyền dịch",
    status: "Sẵn sàng",
    department: "Ngoại khoa",
    phone: "090 345 6789",
    email: "lara@mintcare.com",
    location: "Brooklyn",
    avatar: 'https://ui-avatars.com/api/?name=Lara+Croft&background=a855f7&color=fff&size=150&bold=true&rounded=true',
    isNew: false,
    available: true,
  },
  {
    id: "4",
    name: "Peter Parker",
    role: "Chuyên gia dinh dưỡng",
    status: "Sẵn sàng",
    department: "Nội khoa",
    phone: "090 456 7890",
    email: "peter@mintcare.com",
    location: "Manhattan",
    avatar: 'https://ui-avatars.com/api/?name=Peter+Parker&background=3b82f6&color=fff&size=150&bold=true&rounded=true',
    isNew: false,
    available: true,
  },
];

const patientData = [
  {
    id: "BN-0842",
    name: "Evelyn Green",
    age: 64,
    gender: "Nữ",
    lastVisit: "12/06/2024",
    lastVisitTime: "09:15 AM",
    status: "Đang điều trị",
    summary: "Bệnh nhân có tiền sử cao huyết áp và tiểu đường type 2. Hiện đang trong lộ trình phục hồi sau phẫu thuật thay khớp gối trái.",
    assignedStaff: ["1", "2"],
  },
  {
    id: "BN-0721",
    name: "Oscar White",
    age: 72,
    gender: "Nam",
    lastVisit: "11/06/2024",
    lastVisitTime: "02:30 PM",
    status: "Chờ tái khám",
    summary: "Bệnh nhân cần kiểm tra định kỳ hàng tháng về chức năng tim mạch.",
    assignedStaff: ["2"],
  },
  {
    id: "BN-1052",
    name: "Rose Thorne",
    age: 45,
    gender: "Nữ",
    lastVisit: "09/06/2024",
    lastVisitTime: "10:00 AM",
    status: "Đang điều trị",
    summary: "Đang điều trị liệu pháp truyền dịch tại gia.",
    assignedStaff: ["3"],
  },
];

const visitData = [
  {
    id: "1",
    type: "Kiểm tra sức khỏe",
    patientId: "BN-0842",
    staffId: "1",
    date: "2026-07-07",
    time: "08:00 - 09:00",
    startTime: "08:00",
    endTime: "09:00",
    duration: "1h",
    status: "Đang thực hiện",
  },
  {
    id: "2",
    type: "Vật lý trị liệu",
    patientId: "BN-0721",
    staffId: "2",
    date: "2026-07-07",
    time: "09:00 - 10:30",
    startTime: "09:00",
    endTime: "10:30",
    duration: "1.5h",
    status: "Đã xác nhận",
  },
  {
    id: "3",
    type: "Truyền dịch y tế",
    patientId: "BN-1052",
    staffId: "3",
    date: "2026-07-07",
    time: "10:00 - 11:00",
    startTime: "10:00",
    endTime: "11:00",
    duration: "1h",
    status: "Đã xác nhận",
  },
  {
    id: "4",
    type: "Tư vấn dinh dưỡng",
    patientId: "BN-0842",
    staffId: "4",
    date: "2026-07-07",
    time: "16:00 - 17:00",
    startTime: "16:00",
    endTime: "17:00",
    duration: "1h",
    status: "Đã xác nhận",
  },
];

const logData = [
  {
    id: "1",
    status: "completed",
    title: "Ca trực hoàn tất",
    desc: "Sandra B. đã hoàn tất thăm khám tại Quận Queens",
    time: "14:22 PM",
    color: "bg-primary",
  },
  {
    id: "2",
    status: "assigned",
    title: "Đã phân công tự động",
    desc: "Đã phân công VLTL cho Arthur D. vào ngày mai",
    time: "13:50 PM",
    color: "bg-on-surface-tertiary",
  },
  {
    id: "3",
    status: "review",
    title: "Đánh giá mới",
    desc: "Bệnh nhân Oscar W. đã đánh giá 5/5",
    time: "12:05 PM",
    color: "bg-hairline",
  },
];

async function main() {
  console.log("Bắt đầu dọn dẹp cơ sở dữ liệu cũ...");
  await prisma.activityLog.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.patientStaff.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.staff.deleteMany();

  console.log("Đang import dữ liệu nhân viên y tế...");
  for (const s of staffData) {
    await prisma.staff.create({
      data: {
        Id: s.id,
        Name: s.name,
        Role: s.role,
        Status: s.status,
        Department: s.department,
        Phone: s.phone,
        Email: s.email,
        Location: s.location,
        Avatar: s.avatar,
        Available: s.available,
        IsNew: s.isNew,
      },
    });
  }

  console.log("Đang import dữ liệu bệnh nhân...");
  for (const p of patientData) {
    await prisma.patient.create({
      data: {
        Id: p.id,
        Name: p.name,
        Age: p.age,
        Gender: p.gender,
        LastVisit: p.lastVisit,
        LastVisitTime: p.lastVisitTime,
        Status: p.status,
        Summary: p.summary,
      },
    });
  }

  console.log("Đang liên kết bệnh nhân với nhân viên y tế...");
  for (const p of patientData) {
    for (const staffId of p.assignedStaff) {
      await prisma.patientStaff.create({
        data: {
          PatientId: p.id,
          StaffId: staffId,
        },
      });
    }
  }

  console.log("Đang import dữ liệu lịch khám...");
  for (const v of visitData) {
    await prisma.visit.create({
      data: {
        Id: v.id,
        Type: v.type,
        PatientId: v.patientId,
        StaffId: v.staffId,
        Date: (v as any).date || null,
        Time: v.time,
        StartTime: v.startTime,
        EndTime: v.endTime,
        Duration: v.duration,
        Status: v.status,
      },
    });
  }

  console.log("Đang import dữ liệu lịch sử hoạt động...");
  for (const l of logData) {
    await prisma.activityLog.create({
      data: {
        Id: l.id,
        Status: l.status,
        Title: l.title,
        Desc: l.desc,
        Time: l.time,
        Color: l.color,
      },
    });
  }

  console.log("Seed dữ liệu thành công!");
}

main()
  .catch((e) => {
    console.error("Lỗi khi seed dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
