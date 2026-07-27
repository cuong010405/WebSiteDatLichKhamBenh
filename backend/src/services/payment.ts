import crypto from "crypto";
import { db } from "../db";

function mapPayment(p: any) {
  const isVisitCancelled = p.Visit?.Status === "Đã hủy";
  return {
    id: p.Id,
    visitId: p.VisitId,
    userId: p.UserId ?? null,
    amount: p.Amount,
    method: p.Method,
    status: isVisitCancelled ? "Đã hủy" : p.Status,
    note: p.Note ?? "",
    createdAt: p.CreatedAt?.toISOString() ?? "",
    // Joined visit info
    visitType: p.Visit?.Type ?? "",
    visitTime: p.Visit?.Time ?? "",
    visitDate: p.Visit?.Date ?? "",
    visitStatus: p.Visit?.Status ?? "",
    startTime: p.Visit?.StartTime ?? "",
    endTime: p.Visit?.EndTime ?? "",
    duration: p.Visit?.Duration ?? "",
    careMode: p.Visit?.CareMode ?? "",
    packagePlan: p.Visit?.PackagePlan ?? "",
    packageShift: p.Visit?.PackageShift ?? "",
    address: p.Visit?.CustomerArea ?? "",
    patientName: p.Visit?.Patient?.Name ?? "",
    staffName: p.Visit?.Staff?.Name ?? "",
    staffPhone: p.Visit?.Staff?.Phone ?? "",
    staffSpecialty: p.Visit?.Staff?.Specialty ?? "",
    userName: p.Visit?.User?.FullName ?? "",
    userPhone: p.Visit?.User?.Phone ?? "",
    userEmail: p.Visit?.User?.Email ?? "",
  };
}

const visitInclude = {
  Visit: {
    include: {
      Patient: true,
      Staff: true,
      User: true,
    },
  },
};

function getPriceByVisitType(type: string): string {
  if (!type) return "200000";
  if (type.includes("Vật lý")) return "500000";
  if (type.includes("Truyền")) return "400000";
  if (type.includes("Chăm sóc")) return "300000";
  return "200000";
}

export async function getPaymentList() {
  const payments = await db.payment.findMany({
    include: visitInclude,
    orderBy: { CreatedAt: "desc" },
  });

  const existingVisitIdsWithPayment = new Set(
    payments.map((p) => p.VisitId).filter(Boolean)
  );

  // Fetch visits that are cancelled (Status === "Đã hủy") and don't have an explicit payment record yet
  const cancelledVisits = await db.visit.findMany({
    where: {
      Status: "Đã hủy",
    },
    include: {
      Patient: true,
      Staff: true,
      User: true,
    },
    orderBy: { Id: "desc" },
  });

  const mappedPayments = payments.map(mapPayment);

  const mappedCancelledVisits = cancelledVisits
    .filter((v) => !existingVisitIdsWithPayment.has(v.Id))
    .map((v) => ({
      id: `cancel-${v.Id}`,
      visitId: v.Id,
      userId: v.UserId ?? null,
      amount: v.PaymentAmount || getPriceByVisitType(v.Type ?? ""),
      method: v.PaymentMethod || "Chưa thanh toán",
      status: "Đã hủy",
      note: v.PaymentNote || "Lịch hẹn đã bị hủy",
      createdAt: v.Date ? new Date(v.Date).toISOString() : new Date().toISOString(),
      visitType: v.Type ?? "",
      visitTime: v.Time ?? "",
      visitDate: v.Date ?? "",
      visitStatus: v.Status ?? "Đã hủy",
      startTime: v.StartTime ?? "",
      endTime: v.EndTime ?? "",
      duration: v.Duration ?? "",
      careMode: v.CareMode ?? "",
      packagePlan: v.PackagePlan ?? "",
      packageShift: v.PackageShift ?? "",
      address: v.CustomerArea ?? "",
      patientName: v.Patient?.Name ?? "",
      staffName: v.Staff?.Name ?? "",
      staffPhone: (v.Staff as any)?.Phone ?? "",
      staffSpecialty: (v.Staff as any)?.Specialty ?? "",
      userName: v.User?.FullName ?? "",
      userPhone: (v.User as any)?.Phone ?? "",
      userEmail: (v.User as any)?.Email ?? "",
    }));

  const allList = [...mappedPayments, ...mappedCancelledVisits];
  allList.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return allList;
}

export async function getPaymentById(id: string) {
  const payment = await db.payment.findUnique({
    where: { Id: id },
    include: visitInclude,
  });
  if (!payment) return null;
  return mapPayment(payment);
}

export async function createPayment(data: {
  visitId: string;
  userId?: string;
  amount: string;
  method: string;
  note?: string;
}) {
  const id = crypto.randomUUID();

  // Find the visit first to get PatientId and CareMode/PackagePlan
  const visit = await db.visit.findUnique({
    where: { Id: data.visitId },
    select: { PatientId: true, CareMode: true, PackagePlan: true },
  });

  // For package/monthly visits, keep the visit "Đã xác nhận" so it stays on the schedule.
  // Only single/hourly visits should move to "Đã hoàn tất".
  const isPackage = visit?.CareMode === "package" || !!visit?.PackagePlan;
  const newVisitStatus = isPackage ? "Đã xác nhận" : "Đã hoàn tất";

  // Create payment record
  const payment = await db.payment.create({
    data: {
      Id: id,
      VisitId: data.visitId,
      UserId: data.userId ?? null,
      Amount: data.amount,
      Method: data.method,
      Status: "Đã thanh toán",
      Note: data.note ?? null,
    },
    include: visitInclude,
  });

  // Update Visit payment status
  const updatedVisit = await db.visit.update({
    where: { Id: data.visitId },
    data: {
      PaymentStatus: "Đã thanh toán",
      PaymentMethod: data.method,
      PaymentAmount: data.amount,
      PaymentNote: data.note ?? null,
      Status: newVisitStatus,
    },
  });

  if (!isPackage && updatedVisit.PatientId) {
    await db.patient.update({
      where: { Id: updatedVisit.PatientId },
      data: { Status: "Khám hoàn thành" },
    });
  }

  return mapPayment(payment);
}

export async function deletePayment(id: string) {
  let visitId: string | null = null;
  let targetPaymentId: string | null = null;

  if (id.startsWith("cancel-")) {
    visitId = id.replace("cancel-", "");
  } else {
    const payment = await db.payment.findUnique({ where: { Id: id } });
    if (payment) {
      targetPaymentId = payment.Id;
      visitId = payment.VisitId;
    } else {
      visitId = id;
    }
  }

  // 1. Delete payment records
  if (targetPaymentId) {
    await db.payment.delete({ where: { Id: targetPaymentId } }).catch(() => {});
  }
  if (visitId) {
    await db.payment.deleteMany({ where: { VisitId: visitId } }).catch(() => {});
  }

  // 2. Delete associated Visit and related logs
  if (visitId) {
    const visit = await db.visit.findUnique({ where: { Id: visitId } });

    if (visit) {
      const patientId = visit.PatientId;

      // Delete CareLogs for this visit service/patient
      if (patientId) {
        await db.careLog.deleteMany({
          where: {
            PatientId: patientId,
            ServiceName: visit.Type || undefined,
          },
        }).catch(() => {});
      }

      // Delete the Visit record itself
      await db.visit.delete({ where: { Id: visitId } }).catch(() => {});

      // Clean up Patient profile if patient has no other remaining visits
      if (patientId) {
        const remainingVisits = await db.visit.count({ where: { PatientId: patientId } });
        if (remainingVisits === 0) {
          await db.patientStaff.deleteMany({ where: { PatientId: patientId } }).catch(() => {});
          await db.careLog.deleteMany({ where: { PatientId: patientId } }).catch(() => {});
          await db.patient.delete({ where: { Id: patientId } }).catch(() => {});
        }
      }
    }
  }

  return { success: true };
}
