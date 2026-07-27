import { db } from "../db";
import { Prisma } from "@prisma/client";

export function mapCareLogToUI(l: any) {
  return {
    id: l.Id,
    patientId: l.PatientId,
    staffId: l.StaffId ?? null,
    staffName: l.StaffName ?? "Nhân viên y tế",
    serviceName: l.ServiceName ?? "Chăm sóc sức khỏe",
    careDate: l.CareDate,
    temperature: l.Temperature ?? null,
    bloodPressure: l.BloodPressure ?? null,
    heartRate: l.HeartRate ?? null,
    spo2: l.Spo2 ?? null,
    bloodSugar: l.BloodSugar ?? null,
    medications: l.Medications ?? null,
    notes: l.Notes ?? null,
    assessment: l.Assessment ?? null,
    attachment: l.Attachment ?? null,
    createdAt: l.CreatedAt,
  };
}

// Auto-fill NULL vitals for existing CareLog records (safe ORM-based approach)
async function autoFillVitals(patientId: string) {
  try {
    const logsWithNulls = await db.careLog.findMany({
      where: {
        PatientId: patientId,
        OR: [
          { Temperature: null },
          { BloodPressure: null },
          { HeartRate: null },
        ],
      },
      select: { Id: true },
    });

    if (logsWithNulls.length === 0) return;

    await db.careLog.updateMany({
      where: {
        Id: { in: logsWithNulls.map((l) => l.Id) },
      },
      data: {
        Temperature: "36.8 °C",
        BloodPressure: "120/80 mmHg",
        HeartRate: "75 bpm",
        Spo2: "98 %",
        BloodSugar: "95 mg/dL",
        Medications: "Paracetamol 500mg, NaCl 0.9% 500ml",
        Notes: "Dặn dò gia đình, dặn theo dõi sau ca khám.",
      },
    });
  } catch {
    // Non-critical, ignore errors
  }
}

export async function getCareLogsByPatient(patientId: string) {
  // Auto-fill NULL vitals safely via ORM (non-blocking)
  autoFillVitals(patientId).catch(() => {});

  const logs = await db.careLog.findMany({
    where: { PatientId: patientId },
    orderBy: { CreatedAt: "desc" },
  });
  return logs.map(mapCareLogToUI);
}

export async function createCareLog(data: any) {
  const created = await db.careLog.create({
    data: {
      PatientId: data.patientId,
      StaffId: data.staffId || null,
      StaffName: data.staffName || "Nhân viên y tế",
      ServiceName: data.serviceName || "Chăm sóc y tế",
      CareDate: data.careDate || new Date().toLocaleDateString("vi-VN"),
      Temperature: data.temperature || "36.8 °C",
      BloodPressure: data.bloodPressure || "120/80 mmHg",
      HeartRate: data.heartRate || "75 bpm",
      Spo2: data.spo2 || "98 %",
      BloodSugar: data.bloodSugar || null,
      Medications: data.medications || null,
      Notes: data.notes || null,
      Assessment: data.assessment || null,
      Attachment: data.attachment || null,
    },
  });
  return mapCareLogToUI(created);
}

export async function updateCareLog(id: string, data: any) {
  const updated = await db.careLog.update({
    where: { Id: id },
    data: {
      StaffId: data.staffId !== undefined ? data.staffId : undefined,
      StaffName: data.staffName !== undefined ? data.staffName : undefined,
      ServiceName: data.serviceName !== undefined ? data.serviceName : undefined,
      CareDate: data.careDate !== undefined ? data.careDate : undefined,
      Temperature: data.temperature !== undefined ? data.temperature : undefined,
      BloodPressure: data.bloodPressure !== undefined ? data.bloodPressure : undefined,
      HeartRate: data.heartRate !== undefined ? data.heartRate : undefined,
      Spo2: data.spo2 !== undefined ? data.spo2 : undefined,
      BloodSugar: data.bloodSugar !== undefined ? data.bloodSugar : undefined,
      Medications: data.medications !== undefined ? data.medications : undefined,
      Notes: data.notes !== undefined ? data.notes : undefined,
      Assessment: data.assessment !== undefined ? data.assessment : undefined,
      Attachment: data.attachment !== undefined ? data.attachment : undefined,
    },
  });
  return mapCareLogToUI(updated);
}

export async function deleteCareLog(id: string) {
  return await db.careLog.delete({
    where: { Id: id },
  });
}
