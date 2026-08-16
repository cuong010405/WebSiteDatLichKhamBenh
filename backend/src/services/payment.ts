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
    // Bỏ qua các visit đã có payment record (đã xử lý ở mappedPayments)
    // và bỏ qua các visit bị admin xóa hóa đơn (đã ghi vào ActivityLog)
    .filter((v) => {
      if (existingVisitIdsWithPayment.has(v.Id)) return false;
      // Visit bị admin xóa hóa đơn → ẩn khỏi trang thanh toán
      if (v.PaymentNote && v.PaymentNote.includes("bị xóa/hủy bởi quản trị viên")) return false;
      return true;
    })
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

  // ── Snapshot thông tin trước khi xóa để ghi log ──
  let snapshotAmount = "";
  let snapshotMethod = "";
  let snapshotNote = "";
  let snapshotVisitType = "";
  let snapshotPatientName = "";
  let snapshotStatus = "";

  if (id.startsWith("cancel-")) {
    visitId = id.replace("cancel-", "");
  } else {
    const payment = await db.payment.findUnique({
      where: { Id: id },
      include: {
        Visit: {
          include: {
            Patient: true,
            User: true,
          },
        },
      },
    });
    if (payment) {
      targetPaymentId = payment.Id;
      visitId = payment.VisitId;
      snapshotAmount = payment.Amount ?? "";
      snapshotMethod = payment.Method ?? "";
      snapshotNote = payment.Note ?? "";
      snapshotStatus = payment.Status ?? "";
      snapshotVisitType = (payment as any).Visit?.Type ?? "";
      snapshotPatientName =
        (payment as any).Visit?.Patient?.Name ||
        (payment as any).Visit?.User?.FullName ||
        "";
    } else {
      visitId = id;
    }
  }

  // Nếu là cancel-visit, lấy thông tin visit để ghi log
  if (id.startsWith("cancel-") && visitId) {
    const visit = await db.visit.findUnique({
      where: { Id: visitId },
      include: { Patient: true, User: true },
    });
    if (visit) {
      snapshotAmount = visit.PaymentAmount ?? "";
      snapshotMethod = visit.PaymentMethod ?? "";
      snapshotNote = visit.PaymentNote ?? "";
      snapshotVisitType = visit.Type ?? "";
      snapshotStatus = "Đã hủy";
      snapshotPatientName =
        (visit as any).Patient?.Name ||
        (visit as any).User?.FullName ||
        "";
    }
  }

  // 1. Delete payment records
  if (targetPaymentId) {
    await db.payment.delete({ where: { Id: targetPaymentId } }).catch(() => {});
  }
  if (visitId) {
    await db.payment.deleteMany({ where: { VisitId: visitId } }).catch(() => {});
  }

  // 2. Set Visit status and payment status to "Đã hủy", GIỮ NGUYÊN số tiền dịch vụ để phiếu đặt lịch hiển thị đúng
  if (visitId) {
    const finalAmount = snapshotAmount || getPriceByVisitType(snapshotVisitType);
    await db.visit.update({
      where: { Id: visitId },
      data: {
        Status: "Đã hủy",
        PaymentStatus: "Đã hủy",
        PaymentAmount: finalAmount || undefined,
        PaymentMethod: snapshotMethod || "Chưa thanh toán",
        PaymentNote: "Hóa đơn đã bị xóa/hủy bởi quản trị viên",
      },
    }).catch(() => {});
  }

  // 3. Ghi nhận vào ActivityLog
  try {
    const amountNum = parseFloat(snapshotAmount) || 0;
    const amountFmt = amountNum > 0
      ? amountNum.toLocaleString("vi-VN") + "đ"
      : "Không rõ";
    const now = new Date();
    const timeStr = now.toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const descParts = [
      `Mã hóa đơn: ${targetPaymentId || id}`,
      snapshotPatientName ? `Bệnh nhân: ${snapshotPatientName}` : "",
      snapshotVisitType ? `Dịch vụ: ${snapshotVisitType}` : "",
      `Số tiền: ${amountFmt}`,
      snapshotMethod ? `Phương thức: ${snapshotMethod}` : "",
      snapshotNote ? `Ghi chú gốc: ${snapshotNote}` : "",
      `Trạng thái lúc xóa: ${snapshotStatus || "Không rõ"}`,
    ].filter(Boolean).join(" · ");

    await db.activityLog.create({
      data: {
        Id: crypto.randomUUID(),
        Status: "deleted",
        Title: `Xóa hóa đơn${snapshotPatientName ? " – " + snapshotPatientName : ""}`,
        Desc: descParts,
        Time: timeStr,
        Color: "red",
      },
    });
  } catch (logErr) {
    console.warn("Lỗi ghi ActivityLog khi xóa hóa đơn:", logErr);
  }

  return { success: true };
}
