import { db } from "../db";

export interface LicenseInput {
  staffId: string;
  licenseNumber: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  specialty?: string;
  note?: string;
}

function mapLicense(l: any) {
  return {
    id: l.Id,
    staffId: l.StaffId,
    licenseNumber: l.LicenseNumber,
    issuedBy: l.IssuedBy,
    issuedDate: l.IssuedDate,
    expiryDate: l.ExpiryDate ?? null,
    specialty: l.Specialty ?? null,
    note: l.Note ?? null,
  };
}

export async function getLicensesByStaffId(staffId: string) {
  const licenses = await db.staffLicense.findMany({
    where: { StaffId: staffId },
    orderBy: { IssuedDate: "desc" },
  });
  return licenses.map(mapLicense);
}

export async function createLicense(data: LicenseInput) {
  const created = await db.staffLicense.create({
    data: {
      Id: crypto.randomUUID(),
      StaffId: data.staffId,
      LicenseNumber: data.licenseNumber,
      IssuedBy: data.issuedBy,
      IssuedDate: data.issuedDate,
      ExpiryDate: data.expiryDate ?? null,
      Specialty: data.specialty ?? null,
      Note: data.note ?? null,
    },
  });
  return mapLicense(created);
}

export async function updateLicense(id: string, data: Partial<LicenseInput>) {
  const dbData: any = {};
  if (data.licenseNumber !== undefined) dbData.LicenseNumber = data.licenseNumber;
  if (data.issuedBy !== undefined) dbData.IssuedBy = data.issuedBy;
  if (data.issuedDate !== undefined) dbData.IssuedDate = data.issuedDate;
  if (data.expiryDate !== undefined) dbData.ExpiryDate = data.expiryDate ?? null;
  if (data.specialty !== undefined) dbData.Specialty = data.specialty ?? null;
  if (data.note !== undefined) dbData.Note = data.note ?? null;

  const updated = await db.staffLicense.update({
    where: { Id: id },
    data: dbData,
  });
  return mapLicense(updated);
}

export async function deleteLicense(id: string) {
  return db.staffLicense.delete({ where: { Id: id } });
}
