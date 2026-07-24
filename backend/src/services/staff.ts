import { db } from "../db";
import { staffSchema } from "../validations/schemas";
import { z } from "zod";

function mapStaffToUI(s: any) {
  return {
    id: s.Id,
    name: s.Name,
    role: s.Role,
    status: s.Status,
    department: s.Department,
    phone: s.Phone,
    email: s.Email,
    location: s.Location,
    avatar: s.Avatar ?? "",
    available: s.Available,
    isNew: s.IsNew,
    licenses: (s.StaffLicense ?? []).map((l: any) => ({
      id: l.Id,
      staffId: l.StaffId,
      licenseNumber: l.LicenseNumber,
      issuedBy: l.IssuedBy,
      issuedDate: l.IssuedDate,
      expiryDate: l.ExpiryDate ?? null,
      specialty: l.Specialty ?? null,
      note: l.Note ?? null,
    })),
  };
}

function mapStaffToDb(s: any) {
  return {
    Id: s.id,
    Name: s.name,
    Role: s.role,
    Status: s.status ?? "Sẵn sàng",
    Department: s.department,
    Phone: s.phone || "0000000000",
    Email: s.email || "unknown@mintcare.com",
    Location: s.location || "Van phong chinh",
    Avatar: s.avatar || null,
    Available: s.available ?? true,
    IsNew: s.isNew ?? false,
  };
}

export async function getStaffList() {
  const staff = await db.staff.findMany({
    orderBy: { Name: "asc" },
  });
  return staff.map(mapStaffToUI);
}

export async function getStaffById(id: string) {
  const s = await db.staff.findUnique({
    where: { Id: id },
    include: { StaffLicense: true },
  });
  if (!s) return null;
  return mapStaffToUI(s);
}

export async function createStaff(data: z.infer<typeof staffSchema>) {
  const validated = staffSchema.parse(data);
  const created = await db.staff.create({
    data: mapStaffToDb(validated),
  });
  return mapStaffToUI(created);
}

export async function updateStaff(id: string, data: Partial<z.infer<typeof staffSchema>>) {
  const { id: _id, ...rest } = data;
  const dbData: any = {};
  if (rest.name !== undefined) dbData.Name = rest.name;
  if (rest.role !== undefined) dbData.Role = rest.role;
  if (rest.status !== undefined) dbData.Status = rest.status;
  if (rest.department !== undefined) dbData.Department = rest.department;
  if (rest.phone !== undefined) dbData.Phone = rest.phone;
  if (rest.email !== undefined) dbData.Email = rest.email;
  if (rest.location !== undefined) dbData.Location = rest.location;
  if (rest.avatar !== undefined) dbData.Avatar = rest.avatar || null;
  if (rest.available !== undefined) dbData.Available = rest.available;
  if (rest.isNew !== undefined) dbData.IsNew = rest.isNew;

  const updated = await db.staff.update({
    where: { Id: id },
    data: dbData,
  });
  return mapStaffToUI(updated);
}

export async function deleteStaff(id: string) {
  return await db.$transaction(async (tx) => {
    // Delete patient-staff relations first
    await tx.patientStaff.deleteMany({
      where: { StaffId: id },
    });
    // Note: Visit.StaffId is non-nullable in schema (NOT NULL FK), so visits
    // referencing this staff member must be deleted to maintain referential integrity.
    // Payment records linked to those visits are cascade-deleted by FK_Payment_Visit.
    await tx.visit.deleteMany({
      where: { StaffId: id },
    });
    // Delete staff member
    return await tx.staff.delete({
      where: { Id: id },
    });
  });
}
