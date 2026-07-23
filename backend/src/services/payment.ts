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
    patientName: p.Visit?.Patient?.Name ?? "",
    staffName: p.Visit?.Staff?.Name ?? "",
    userName: p.Visit?.User?.FullName ?? "",
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
      patientName: v.Patient?.Name ?? "",
      staffName: v.Staff?.Name ?? "",
      userName: v.User?.FullName ?? "",
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

  // Find the visit first to get PatientId
  const visit = await db.visit.findUnique({
    where: { Id: data.visitId },
    select: { PatientId: true },
  });

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
      Status: "Đã hoàn tất",
    },
  });

  if (updatedVisit.PatientId) {
    await db.patient.update({
      where: { Id: updatedVisit.PatientId },
      data: { Status: "Khám hoàn thành" },
    });
  }

  return mapPayment(payment);
}

export async function deletePayment(id: string) {
  const payment = await db.payment.findUnique({ where: { Id: id } });
  if (!payment) throw new Error("Không tìm thấy hóa đơn");

  // Revert visit payment status
  await db.visit.update({
    where: { Id: payment.VisitId },
    data: {
      PaymentStatus: "Chưa thanh toán",
      PaymentMethod: null,
      PaymentAmount: null,
      PaymentNote: null,
      Status: "Đã xác nhận",
    },
  });

  await db.payment.delete({ where: { Id: id } });
  return { success: true };
}
