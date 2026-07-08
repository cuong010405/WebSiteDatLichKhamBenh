import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function mapPayment(p: any) {
  return {
    id: p.Id,
    visitId: p.VisitId,
    userId: p.UserId ?? null,
    amount: p.Amount,
    method: p.Method,
    status: p.Status,
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

export async function getPaymentList() {
  const payments = await prisma.payment.findMany({
    include: visitInclude,
    orderBy: { CreatedAt: "desc" },
  });
  return payments.map(mapPayment);
}

export async function getPaymentById(id: string) {
  const payment = await prisma.payment.findUnique({
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
  const id = require("crypto").randomUUID();

  // Find the visit first to get PatientId
  const visit = await prisma.visit.findUnique({
    where: { Id: data.visitId },
    select: { PatientId: true },
  });

  // Create payment record
  const payment = await prisma.payment.create({
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
  await prisma.visit.update({
    where: { Id: data.visitId },
    data: {
      PaymentStatus: "Đã thanh toán",
      PaymentMethod: data.method,
      PaymentAmount: data.amount,
      PaymentNote: data.note ?? null,
      Status: "Đã hoàn tất",
    },
  });

  return mapPayment(payment);
}

export async function deletePayment(id: string) {
  const payment = await prisma.payment.findUnique({ where: { Id: id } });
  if (!payment) throw new Error("Không tìm thấy hóa đơn");

  // Revert visit payment status
  await prisma.visit.update({
    where: { Id: payment.VisitId },
    data: {
      PaymentStatus: "Chưa thanh toán",
      PaymentMethod: null,
      PaymentAmount: null,
      PaymentNote: null,
      Status: "Đã xác nhận",
    },
  });

  await prisma.payment.delete({ where: { Id: id } });
  return { success: true };
}
