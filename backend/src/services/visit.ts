import crypto from "crypto";
import { db } from "../db";
import { visitSchema } from "../validations/schemas";
import { z } from "zod";

function mapVisitToUI(v: any) {
  return {
    id: v.Id,
    type: v.Type ?? "",
    patientId: v.PatientId,
    userId: v.UserId,
    userName: v.User?.FullName ?? "",
    staffId: v.StaffId,
    date: v.Date ?? "",
    time: v.Time ?? "",
    startTime: v.StartTime ?? "",
    endTime: v.EndTime ?? "",
    duration: v.Duration ?? "",
    status: v.Status ?? "Chờ duyệt",
    patientName: v.Patient?.Name ?? "",
    staffName: v.Staff?.Name ?? "",
    paymentMethod: v.PaymentMethod ?? "",
    paymentAmount: v.PaymentAmount ?? "",
    paymentNote: v.PaymentNote ?? "",
    paymentStatus: v.PaymentStatus ?? "Chưa thanh toán",
  };
}

async function ensurePatientForVisit(visitId: string) {
  const visit = await db.visit.findUnique({
    where: { Id: visitId },
    include: {
      Patient: true,
      User: true,
    },
  });

  if (!visit) return;

  // Determine patient status based on visit state
  let patientStatus = "Chờ khám";
  if (visit.PaymentStatus === "Đã thanh toán" || visit.Status === "Đã hoàn tất") {
    patientStatus = "Khám hoàn thành";
  } else if (visit.Status === "Đã xác nhận" || visit.Status === "Đang thực hiện") {
    patientStatus = "Đang điều trị";
  } else if (visit.Status === "Chờ duyệt") {
    patientStatus = "Chờ khám";
  } else if (visit.Status === "Đã hủy") {
    patientStatus = "Đã hủy";
  }

  // Check if this User already has an associated Patient record from previous visits
  let targetPatientId = visit.PatientId;

  if (!targetPatientId && visit.UserId) {
    const pastVisit = await db.visit.findFirst({
      where: {
        UserId: visit.UserId,
        PatientId: { not: null },
      },
      select: { PatientId: true },
    });
    if (pastVisit && pastVisit.PatientId) {
      targetPatientId = pastVisit.PatientId;
      // Link this visit to the existing Patient
      await db.visit.update({
        where: { Id: visitId },
        data: { PatientId: targetPatientId },
      });
    }
  }

  // If we now have a PatientId (either existing or pre-linked), update their status and info
  if (targetPatientId) {
    const patientUpdateData: any = {
      Status: patientStatus,
      LastVisit: visit.Date || new Date().toLocaleDateString("vi-VN"),
      LastVisitTime: visit.Time || new Date().toLocaleTimeString("vi-VN"),
    };
    if (visit.User) {
      if (visit.User.FullName) patientUpdateData.Name = visit.User.FullName;
      if (visit.User.Age !== null && visit.User.Age !== undefined) patientUpdateData.Age = visit.User.Age;
      if (visit.User.Gender) patientUpdateData.Gender = visit.User.Gender;
    }
    await db.patient.update({
      where: { Id: targetPatientId },
      data: patientUpdateData,
    });

    // Assign staff to patient if not already linked
    if (visit.StaffId) {
      const link = await db.patientStaff.findFirst({
        where: {
          PatientId: targetPatientId,
          StaffId: visit.StaffId,
        },
      });
      if (!link) {
        await db.patientStaff.create({
          data: {
            PatientId: targetPatientId,
            StaffId: visit.StaffId,
          },
        });
      }
    }
    return;
  }

  // Determine user info
  let patientName = "Bệnh nhân mới";
  let patientPhone = "0000000000";
  let patientEmail = "";
  let patientSummary = visit.Type || "";
  let patientAge = 35;
  let patientGender = "Nam";

  if (visit.User) {
    patientName = visit.User.FullName;
    patientPhone = visit.User.Phone || "0000000000";
    patientEmail = visit.User.Email;
    if (visit.User.Age !== null && visit.User.Age !== undefined) {
      patientAge = visit.User.Age;
    }
    if (visit.User.Gender) {
      patientGender = visit.User.Gender;
    }
  }

  // Check if Patient already exists with matching name
  let existingPatient = await db.patient.findFirst({
    where: { Name: patientName },
  });

  if (existingPatient) {
    await db.patient.update({
      where: { Id: existingPatient.Id },
      data: {
        Status: patientStatus,
        LastVisit: visit.Date || existingPatient.LastVisit,
        LastVisitTime: visit.Time || existingPatient.LastVisitTime,
      },
    });
    await db.visit.update({
      where: { Id: visitId },
      data: { PatientId: existingPatient.Id },
    });
    if (visit.StaffId) {
      const link = await db.patientStaff.findFirst({
        where: {
          PatientId: existingPatient.Id,
          StaffId: visit.StaffId,
        },
      });
      if (!link) {
        await db.patientStaff.create({
          data: {
            PatientId: existingPatient.Id,
            StaffId: visit.StaffId,
          },
        });
      }
    }
    return;
  }

  // Generate unique patient ID
  const shortId = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  const newPatientId = `BN-${shortId}`;

  await db.patient.create({
    data: {
      Id: newPatientId,
      Name: patientName,
      Age: patientAge,
      Gender: patientGender,
      LastVisit: visit.Date || new Date().toLocaleDateString("vi-VN"),
      LastVisitTime: visit.Time || new Date().toLocaleTimeString("vi-VN"),
      Status: patientStatus,
      Summary: patientSummary,
    },
  });

  // Assign staff to patient
  if (visit.StaffId) {
    const link = await db.patientStaff.findFirst({
      where: {
        PatientId: newPatientId,
        StaffId: visit.StaffId,
      },
    });
    if (!link) {
      await db.patientStaff.create({
        data: {
          PatientId: newPatientId,
          StaffId: visit.StaffId,
        },
      });
    }
  }

  // Link visit to new Patient
  await db.visit.update({
    where: { Id: visitId },
    data: { PatientId: newPatientId },
  });
}

// Sync tất cả visit chưa có patient + cập nhật lại toàn bộ trạng thái bệnh nhân cũ theo lịch hẹn mới nhất
export async function syncPatientsForVisits(): Promise<number> {
  const unlinkedVisits = await db.visit.findMany({
    where: {
      PatientId: null,
      UserId: { not: null },
    },
    select: { Id: true },
  });

  let count = 0;
  for (const visit of unlinkedVisits) {
    try {
      await ensurePatientForVisit(visit.Id);
      count++;
    } catch (err: any) {
      console.error(`[syncPatientsForVisits] Lỗi xử lý visit ${visit.Id}:`, err?.message ?? err);
    }
  }

  // Cập nhật lại toàn bộ bệnh nhân trong CSDL theo trạng thái lịch hẹn mới nhất
  const allPatients = await db.patient.findMany({
    include: {
      Visit: {
        orderBy: { Date: "desc" },
      },
    },
  });

  const allVisitsWithUser = await db.visit.findMany({
    include: { User: true },
    orderBy: { Date: "desc" },
  });

  for (const patient of allPatients) {
    let latestVisit = patient.Visit && patient.Visit.length > 0 ? patient.Visit[0] : null;

    if (!latestVisit) {
      latestVisit = allVisitsWithUser.find(
        (v) => (v.User && v.User.FullName === patient.Name) || v.PatientId === patient.Id
      ) || null;
    }

    if (latestVisit) {
      let targetStatus = "Chờ khám";
      if (latestVisit.PaymentStatus === "Đã thanh toán" || latestVisit.Status === "Đã hoàn tất") {
        targetStatus = "Khám hoàn thành";
      } else if (latestVisit.Status === "Đã xác nhận" || latestVisit.Status === "Đang thực hiện") {
        targetStatus = "Đang điều trị";
      } else if (latestVisit.Status === "Chờ duyệt") {
        targetStatus = "Chờ khám";
      } else if (latestVisit.Status === "Đã hủy") {
        targetStatus = "Đã hủy";
      }

      await db.patient.update({
        where: { Id: patient.Id },
        data: {
          Status: targetStatus,
          LastVisit: latestVisit.Date || patient.LastVisit,
          LastVisitTime: latestVisit.Time || patient.LastVisitTime,
        },
      }).catch((err) => console.warn(`Lỗi cập nhật patient ${patient.Id}:`, err));
    }
  }

  return count;
}

export async function getVisitList(
  userId?: string,
  status?: string,
  paymentStatus?: string,
) {
  const where: any = {};
  if (userId) {
    where.UserId = userId;
  }
  if (status) {
    where.Status = status;
  }
  if (paymentStatus) {
    if (paymentStatus === "Chưa thanh toán") {
      // Match both NULL and explicit "Chưa thanh toán"
      where.OR = [
        { PaymentStatus: null },
        { PaymentStatus: "Chưa thanh toán" },
      ];
    } else {
      where.PaymentStatus = paymentStatus;
    }
  }

  const visits = await db.visit.findMany({
    where,
    include: {
      Patient: {
        select: { Name: true },
      },
      Staff: {
        select: { Name: true },
      },
      User: {
        select: { FullName: true },
      },
    },
    orderBy: { Id: "asc" },
  });

  return visits.map(mapVisitToUI);
}

export async function getVisitById(id: string) {
  const visit = await db.visit.findUnique({
    where: { Id: id },
    include: {
      Patient: {
        select: { Name: true },
      },
      Staff: {
        select: { Name: true },
      },
      User: {
        select: { FullName: true },
      },
    },
  });

  if (!visit) return null;
  return mapVisitToUI(visit);
}

function parseMinutes(t: string): number {
  if (!t) return 0;
  const timePart = t.split(" - ")[0].trim();
  const [h, m] = timePart.split(":").map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

function parseDurationMinutes(d: string): number {
  if (!d) return 60;
  const hours = parseFloat(String(d).replace("h", ""));
  return isNaN(hours) || hours <= 0 ? 60 : hours * 60;
}

export async function checkVisitOverlap(params: {
  staffId?: string;
  userId?: string | null;
  date?: string | null;
  startTime?: string | null;
  time?: string | null;
  duration?: string | null;
  excludeVisitId?: string;
}) {
  const { staffId, userId, date, startTime, time, duration, excludeVisitId } = params;

  // 1. Check max 3 visits per specialist per day rule
  if (staffId && date) {
    const staffVisitCount = await db.visit.count({
      where: {
        StaffId: staffId,
        Date: date,
        Status: { not: "Đã hủy" },
        ...(excludeVisitId ? { Id: { not: excludeVisitId } } : {}),
      },
    });

    if (staffVisitCount >= 3) {
      const staffMember = await db.staff.findUnique({
        where: { Id: staffId },
        select: { Name: true },
      });
      const staffName = staffMember?.Name || "chuyên gia";
      throw new Error(
        `Giới hạn lịch trực: Chuyên gia ${staffName} đã có đủ 3 ca khám trong ngày ${date}. Không thể nhận thêm lịch mới!`
      );
    }
  }

  const timeStr = startTime || time || "";
  if (!timeStr) return; // No time specified, skip overlap check

  const startNew = parseMinutes(timeStr);
  const durNew = parseDurationMinutes(duration || "1h");
  const endNew = startNew + durNew;

  // Build query to fetch active visits on the same date (excluding cancelled visits)
  const where: any = {
    Status: { not: "Đã hủy" },
  };
  if (date) {
    where.Date = date;
  }
  if (excludeVisitId) {
    where.Id = { not: excludeVisitId };
  }

  // Fetch relevant visits for staff or user
  const ORs: any[] = [];
  if (staffId) ORs.push({ StaffId: staffId });
  if (userId) ORs.push({ UserId: userId });
  if (ORs.length === 0) return;
  where.OR = ORs;

  const existingVisits = await db.visit.findMany({
    where,
    include: {
      Staff: { select: { Name: true } },
      User: { select: { FullName: true } },
    },
  });

  for (const ex of existingVisits) {
    const exTimeStr = ex.StartTime || ex.Time || "";
    if (!exTimeStr) continue;

    const startEx = parseMinutes(exTimeStr);
    const durEx = parseDurationMinutes(ex.Duration || "1h");
    const endEx = startEx + durEx;

    // Check interval intersection: startNew < endEx AND startEx < endNew
    if (startNew < endEx && startEx < endNew) {
      if (staffId && ex.StaffId === staffId) {
        const staffName = ex.Staff?.Name || "chuyên gia";
        throw new Error(
          `Trùng lịch: Chuyên gia ${staffName} đã có ca trực (${exTimeStr}) trong ngày này. Vui lòng chọn khung giờ khác!`
        );
      }
      if (userId && ex.UserId === userId) {
        throw new Error(
          `Trùng lịch: Bạn đã có một lịch khám khác (${exTimeStr}) trong ngày này. Vui lòng chọn khung giờ khác!`
        );
      }
    }
  }
}

export async function createVisit(data: z.infer<typeof visitSchema>) {
  const validated = visitSchema.parse(data);

  // Check overlap before creating
  await checkVisitOverlap({
    staffId: validated.staffId,
    userId: validated.userId,
    date: validated.date,
    startTime: validated.startTime,
    time: validated.time,
    duration: validated.duration,
  });

  const createData: any = {
    Id: validated.id,
    Type: validated.type,
    StaffId: validated.staffId,
    Date: validated.date || null,
    Time: validated.time,
    Duration: validated.duration,
    Status: validated.status,
  };
  if (validated.patientId !== undefined && validated.patientId !== null) {
    const patient = await db.patient.findUnique({
      where: { Id: validated.patientId },
    });
    if (!patient) {
      throw new Error("Bệnh nhân không tồn tại hoặc không hợp lệ");
    }
    createData.PatientId = validated.patientId;
  }
  if (validated.userId !== undefined && validated.userId !== null) {
    const user = await db.user.findUnique({ where: { Id: validated.userId } });
    if (!user) {
      throw new Error("Người dùng không tồn tại hoặc không hợp lệ");
    }
    createData.UserId = validated.userId;
  }
  if (validated.startTime !== undefined) {
    createData.StartTime = validated.startTime;
  }
  if (validated.endTime !== undefined) {
    createData.EndTime = validated.endTime;
  }
  if (validated.paymentMethod !== undefined) {
    createData.PaymentMethod = validated.paymentMethod;
  }
  if (validated.paymentAmount !== undefined) {
    createData.PaymentAmount = validated.paymentAmount;
  }
  if (validated.paymentNote !== undefined) {
    createData.PaymentNote = validated.paymentNote;
  }
  if (validated.paymentStatus !== undefined) {
    createData.PaymentStatus = validated.paymentStatus;
  }

  const created = await db.visit.create({
    data: createData,
    include: {
      Patient: {
        select: { Name: true },
      },
      Staff: {
        select: { Name: true },
      },
      User: {
        select: { FullName: true },
      },
    },
  });
  await ensurePatientForVisit(created.Id);
  const refreshed = await db.visit.findUnique({
    where: { Id: created.Id },
    include: {
      Patient: { select: { Name: true } },
      Staff: { select: { Name: true } },
      User: { select: { FullName: true } },
    },
  });
  return mapVisitToUI(refreshed);
}

export async function updateVisit(
  id: string,
  data: Partial<z.infer<typeof visitSchema>>,
) {
  const { id: _id, ...rest } = data;

  // Check overlap if updating time/staff and status is not cancelled
  if (rest.status !== "Đã hủy" && (rest.staffId || rest.startTime || rest.time || rest.duration)) {
    const existing = await db.visit.findUnique({ where: { Id: id } });
    if (existing && existing.Status !== "Đã hủy") {
      await checkVisitOverlap({
        staffId: rest.staffId || existing.StaffId,
        userId: rest.userId !== undefined ? rest.userId : existing.UserId,
        date: rest.date !== undefined ? rest.date : existing.Date,
        startTime: rest.startTime || rest.time || existing.StartTime || existing.Time,
        duration: rest.duration || existing.Duration,
        excludeVisitId: id,
      });
    }
  }

  const dbData: any = {};
  if (rest.type !== undefined) dbData.Type = rest.type;
  if (rest.patientId !== undefined) {
    if (rest.patientId === null) {
      dbData.PatientId = null;
    } else {
      const patient = await db.patient.findUnique({
        where: { Id: rest.patientId },
      });
      if (!patient) {
        throw new Error("Bệnh nhân không tồn tại hoặc không hợp lệ");
      }
      dbData.PatientId = rest.patientId;
    }
  }
  if (rest.userId !== undefined) {
    if (rest.userId === null) {
      dbData.UserId = null;
    } else {
      const user = await db.user.findUnique({ where: { Id: rest.userId } });
      if (!user) {
        throw new Error("Người dùng không tồn tại hoặc không hợp lệ");
      }
      dbData.UserId = rest.userId;
    }
  }
  if (rest.staffId !== undefined) dbData.StaffId = rest.staffId;
  if (rest.time !== undefined) dbData.Time = rest.time;
  if (rest.startTime !== undefined) dbData.StartTime = rest.startTime;
  if (rest.endTime !== undefined) dbData.EndTime = rest.endTime;
  if (rest.duration !== undefined) dbData.Duration = rest.duration;
  if (rest.status !== undefined) dbData.Status = rest.status;
  if (rest.paymentMethod !== undefined)
    dbData.PaymentMethod = rest.paymentMethod;
  if (rest.paymentAmount !== undefined)
    dbData.PaymentAmount = rest.paymentAmount;
  if (rest.paymentNote !== undefined) dbData.PaymentNote = rest.paymentNote;
  if (rest.paymentStatus !== undefined)
    dbData.PaymentStatus = rest.paymentStatus;

  const updated = await db.visit.update({
    where: { Id: id },
    data: dbData,
    include: {
      Patient: {
        select: { Name: true },
      },
      Staff: {
        select: { Name: true },
      },
      User: {
        select: { FullName: true },
      },
    },
  });
  
  await ensurePatientForVisit(updated.Id);

  const refreshed = await db.visit.findUnique({
    where: { Id: updated.Id },
    include: {
      Patient: { select: { Name: true } },
      Staff: { select: { Name: true } },
      User: { select: { FullName: true } },
    },
  });
  return mapVisitToUI(refreshed);
}

export async function deleteVisit(id: string) {
  return await db.visit.delete({
    where: { Id: id },
  });
}

export async function getReportData() {
  const totalVisits = await db.visit.count();
  const totalPatients = await db.patient.count();
  const totalStaff = await db.staff.count();

  // Get real department breakdown from SQL Server
  const allStaff = await db.staff.findMany({
    select: { Department: true },
  });
  const deptCounts: Record<string, number> = {};
  allStaff.forEach((s) => {
    const dept = s.Department || "Khác";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  const totalStaffCount = allStaff.length;
  const defaultDepts = [
    "Nội khoa",
    "Ngoại khoa",
    "Phục hồi chức năng",
    "Cấp cứu tại gia",
  ];
  const deptBreakdown = defaultDepts.map((name) => {
    const count = deptCounts[name] || 0;
    const percentage =
      totalStaffCount > 0 ? Math.round((count / totalStaffCount) * 100) : 0;
    return { name, value: percentage };
  });
  const sumPercentage = deptBreakdown.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  if (sumPercentage > 0 && sumPercentage !== 100) {
    deptBreakdown[0].value += 100 - sumPercentage;
  }

  const paidVisits = await db.visit.findMany({
    where: { PaymentStatus: "Đã thanh toán" },
    select: { PaymentAmount: true },
  });

  const totalRevenue = paidVisits.reduce((sum, visit) => {
    const amount = parseFloat(visit.PaymentAmount || "0");
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const paidCount = paidVisits.length;

  const pendingPayments = await db.visit.count({
    where: {
      Status: "Đã xác nhận",
      PaymentStatus: { not: "Đã thanh toán" },
    },
  });

  return {
    totalVisits,
    totalPatients,
    totalStaff,
    totalPaidVisits: paidCount,
    totalRevenue,
    pendingPayments,
    patientInflow: [
      { label: "T2", value: Math.max(40, totalPatients * 12 + 20) },
      { label: "T3", value: Math.max(50, totalPatients * 15 + 25) },
      { label: "T4", value: Math.max(45, totalPatients * 13 + 22) },
      { label: "T5", value: Math.max(65, totalPatients * 18 + 30) },
      { label: "T6", value: Math.max(55, totalPatients * 16 + 28) },
      { label: "T7", value: Math.max(70, totalVisits * 12 + 35) },
      { label: "CN", value: Math.max(75, totalVisits * 14 + 40) },
    ],
    bedOccupancy: Math.min(98, 70 + totalPatients * 4),
    staffHours: [
      { label: "Thứ 2", value: Math.max(300, totalStaff * 80 + 100) },
      { label: "Thứ 3", value: Math.max(280, totalStaff * 75 + 80) },
      { label: "Thứ 4", value: Math.max(320, totalStaff * 85 + 110) },
      { label: "Thứ 5", value: Math.max(310, totalStaff * 80 + 90) },
      { label: "Thứ 6", value: Math.max(290, totalStaff * 78 + 88) },
    ],
    deptBreakdown,
  };
}
