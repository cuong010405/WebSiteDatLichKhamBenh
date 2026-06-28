import { db } from "../db";
import { patientSchema } from "../validations/schemas";
import { z } from "zod";

export async function getPatientList() {
  const patients = await db.patient.findMany({
    include: {
      PatientStaff: true
    },
    orderBy: { Name: "asc" },
  });

  return patients.map((p) => ({
    id: p.Id,
    name: p.Name,
    age: p.Age,
    gender: p.Gender,
    lastVisit: p.LastVisit ?? "",
    lastVisitTime: p.LastVisitTime ?? "",
    status: p.Status ?? "Đang điều trị",
    summary: p.Summary ?? "",
    assignedStaff: p.PatientStaff.map((ps) => ps.StaffId),
  }));
}

export async function getPatientById(id: string) {
  const patient = await db.patient.findUnique({
    where: { Id: id },
    include: {
      PatientStaff: true
    },
  });

  if (!patient) return null;

  return {
    id: patient.Id,
    name: patient.Name,
    age: patient.Age,
    gender: patient.Gender,
    lastVisit: patient.LastVisit ?? "",
    lastVisitTime: patient.LastVisitTime ?? "",
    status: patient.Status ?? "Đang điều trị",
    summary: patient.Summary ?? "",
    assignedStaff: patient.PatientStaff.map((ps) => ps.StaffId),
  };
}

export async function createPatient(data: z.infer<typeof patientSchema>) {
  const validated = patientSchema.parse(data);
  const { assignedStaff, ...rest } = validated;

  return await db.$transaction(async (tx) => {
    const created = await tx.patient.create({
      data: {
        Id: rest.id,
        Name: rest.name,
        Age: rest.age,
        Gender: rest.gender,
        LastVisit: rest.lastVisit,
        LastVisitTime: rest.lastVisitTime,
        Status: rest.status,
        Summary: rest.summary || null,
      }
    });

    if (assignedStaff && assignedStaff.length > 0) {
      await tx.patientStaff.createMany({
        data: assignedStaff.map((staffId) => ({
          PatientId: created.Id,
          StaffId: staffId,
        })),
      });
    }

    return {
      id: created.Id,
      name: created.Name,
      age: created.Age,
      gender: created.Gender,
      lastVisit: created.LastVisit ?? "",
      lastVisitTime: created.LastVisitTime ?? "",
      status: created.Status ?? "Đang điều trị",
      summary: created.Summary ?? "",
      assignedStaff: assignedStaff || [],
    };
  });
}

export async function updatePatient(id: string, data: Partial<z.infer<typeof patientSchema>>) {
  const { id: _id, assignedStaff, ...rest } = data;

  return await db.$transaction(async (tx) => {
    const dbData: any = {};
    if (rest.name !== undefined) dbData.Name = rest.name;
    if (rest.age !== undefined) dbData.Age = rest.age;
    if (rest.gender !== undefined) dbData.Gender = rest.gender;
    if (rest.lastVisit !== undefined) dbData.LastVisit = rest.lastVisit;
    if (rest.lastVisitTime !== undefined) dbData.LastVisitTime = rest.lastVisitTime;
    if (rest.status !== undefined) dbData.Status = rest.status;
    if (rest.summary !== undefined) dbData.Summary = rest.summary || null;

    const updated = await tx.patient.update({
      where: { Id: id },
      data: dbData,
    });

    if (assignedStaff !== undefined) {
      await tx.patientStaff.deleteMany({
        where: { PatientId: id },
      });
      if (assignedStaff.length > 0) {
        await tx.patientStaff.createMany({
          data: assignedStaff.map((staffId) => ({
            PatientId: id,
            StaffId: staffId,
          })),
        });
      }
    }

    const currentAssigned = await tx.patientStaff.findMany({
      where: { PatientId: id },
    });

    return {
      id: updated.Id,
      name: updated.Name,
      age: updated.Age,
      gender: updated.Gender,
      lastVisit: updated.LastVisit ?? "",
      lastVisitTime: updated.LastVisitTime ?? "",
      status: updated.Status ?? "Đang điều trị",
      summary: updated.Summary ?? "",
      assignedStaff: currentAssigned.map((ps) => ps.StaffId),
    };
  });
}

export async function deletePatient(id: string) {
  return await db.$transaction(async (tx) => {
    await tx.patientStaff.deleteMany({
      where: { PatientId: id },
    });
    await tx.visit.deleteMany({
      where: { PatientId: id },
    });
    return await tx.patient.delete({
      where: { Id: id },
    });
  });
}
