import { db } from "../db";
import { staffSchema } from "../validations/schemas";
import { z } from "zod";

export async function getStaffList() {
  const staff = await db.staff.findMany({
    orderBy: { name: "asc" },
  });
  return staff.map((s) => ({
    ...s,
    avatar: s.avatar ?? "",
  }));
}

export async function getStaffById(id: string) {
  const s = await db.staff.findUnique({
    where: { id },
    include: { patients: true },
  });
  if (!s) return null;
  return {
    ...s,
    avatar: s.avatar ?? "",
  };
}

export async function createStaff(data: z.infer<typeof staffSchema>) {
  const validated = staffSchema.parse(data);
  const created = await db.staff.create({
    data: validated,
  });
  return {
    ...created,
    avatar: created.avatar ?? "",
  };
}

export async function updateStaff(id: string, data: Partial<z.infer<typeof staffSchema>>) {
  const { id: _id, ...rest } = data;
  const updated = await db.staff.update({
    where: { id },
    data: rest,
  });
  return {
    ...updated,
    avatar: updated.avatar ?? "",
  };
}

export async function deleteStaff(id: string) {
  return await db.staff.delete({
    where: { id },
  });
}
