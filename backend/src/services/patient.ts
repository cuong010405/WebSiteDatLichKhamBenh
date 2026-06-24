import { db } from "../db";
import { patientSchema } from "../validations/schemas";
import { z } from "zod";

export async function getPatientList() {
  const patients = await db.patient.findMany({
    include: {
      assignedStaff: {
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return patients.map((p) => ({
    ...p,
    summary: p.summary ?? "",
    assignedStaff: p.assignedStaff.map((s) => s.id),
  }));
}

export async function getPatientById(id: string) {
  const patient = await db.patient.findUnique({
    where: { id },
    include: {
      assignedStaff: {
        select: { id: true },
      },
    },
  });

  if (!patient) return null;

  return {
    ...patient,
    summary: patient.summary ?? "",
    assignedStaff: patient.assignedStaff.map((s) => s.id),
  };
}

export async function createPatient(data: z.infer<typeof patientSchema>) {
  const validated = patientSchema.parse(data);
  const { assignedStaff, ...rest } = validated;

  const created = await db.patient.create({
    data: {
      ...rest,
      assignedStaff: {
        connect: assignedStaff?.map((id) => ({ id })) || [],
      },
    },
    include: {
      assignedStaff: {
        select: { id: true },
      },
    },
  });

  return {
    ...created,
    summary: created.summary ?? "",
    assignedStaff: created.assignedStaff.map((s) => s.id),
  };
}

export async function updatePatient(id: string, data: Partial<z.infer<typeof patientSchema>>) {
  const { id: _id, assignedStaff, ...rest } = data;

  const updated = await db.patient.update({
    where: { id },
    data: {
      ...rest,
      ...(assignedStaff && {
        assignedStaff: {
          set: assignedStaff.map((staffId) => ({ id: staffId })),
        },
      }),
    },
    include: {
      assignedStaff: {
        select: { id: true },
      },
    },
  });

  return {
    ...updated,
    summary: updated.summary ?? "",
    assignedStaff: updated.assignedStaff.map((s) => s.id),
  };
}

export async function deletePatient(id: string) {
  return await db.patient.delete({
    where: { id },
  });
}
