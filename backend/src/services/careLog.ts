import { db } from "../db";

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

export async function getCareLogsByPatient(patientId: string) {
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
      Temperature: data.temperature || null,
      BloodPressure: data.bloodPressure || null,
      HeartRate: data.heartRate || null,
      Spo2: data.spo2 || null,
      BloodSugar: data.bloodSugar || null,
      Medications: data.medications || null,
      Notes: data.notes || null,
      Assessment: data.assessment || null,
      Attachment: data.attachment || null,
    },
  });
  return mapCareLogToUI(created);
}

export async function deleteCareLog(id: string) {
  return await db.careLog.delete({
    where: { Id: id },
  });
}
