import { db } from "../db";
import { staffSchema } from "../validations/schemas";
import { z } from "zod";
import { assertNoDuplicate } from "./duplicateValidation";

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
    experience: s.Experience ?? null,
    specialty: s.Specialty ?? null,
    staffType: s.StaffType ?? null,
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
    Experience: s.experience || null,
    Specialty: s.specialty || null,
    StaffType: s.staffType || null,
  };
}

const BUSY_VISIT_STATUSES = ["CONFIRMED", "IN_PROGRESS", "ĐÃ XÁC NHẬN", "ĐANG THỰC HIỆN"];

function isTodayVisit(v: any): boolean {
  try {
    if (!v) return false;
    const visitDateStr = (v.Date || v.date || "").trim();
    if (!visitDateStr) return true;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const todaySlash = `${day}/${month}/${year}`;
    const todayDash = `${year}-${month}-${day}`;

    if (visitDateStr === todaySlash || visitDateStr === todayDash) return true;

    // Xử lý gói dịch vụ nhiều ngày (7 ngày, 14 ngày, 30 ngày)
    const combined = `${v.PackagePlan || ""} ${v.packagePlan || ""} ${v.Duration || ""} ${v.duration || ""}`.toLowerCase();
    if (combined.includes("7day") || combined.includes("14day") || combined.includes("30day") || combined.includes("gói") || combined.includes("ngày")) {
      let startDate: Date | null = null;
      if (visitDateStr.includes("/")) {
        const [d, m, y] = visitDateStr.split("/");
        if (d && m && y) startDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      } else if (visitDateStr.includes("-")) {
        const [y, m, d] = visitDateStr.split("-");
        if (y && m && d) startDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      }
      if (startDate && !isNaN(startDate.getTime())) {
        let days = 1;
        if (combined.includes("7day") || combined.includes("7 ngày")) days = 7;
        if (combined.includes("14day") || combined.includes("14 ngày")) days = 14;
        if (combined.includes("30day") || combined.includes("30 ngày")) days = 30;
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days);

        const todayClean = new Date(year, now.getMonth(), now.getDate());
        if (todayClean >= startDate && todayClean < endDate) return true;
      }
    }
  } catch (e) {
    return false;
  }

  return false;
}

export async function getStaffList() {
  try {
    const staff = await db.staff.findMany({
      where: { Id: { not: "PENDING" } },
      include: { StaffLicense: true, Visit: true },
      orderBy: { Name: "asc" },
    });
    return staff.map((s) => {
      const ui = mapStaffToUI(s);
      const activeVisits = (s.Visit || []).filter((v: any) => {
        const st = (v.Status || "").toUpperCase();
        return BUSY_VISIT_STATUSES.includes(st) && isTodayVisit(v);
      });
      if (activeVisits.length > 0 && ui.status !== "Nghỉ phép") {
        ui.status = "Đang bận";
        ui.available = false;
      }
      (ui as any).activeVisitCount = activeVisits.length;
      return ui;
    });
  } catch (err: any) {
    console.error("Error in getStaffList:", err);
    const staffSimple = await db.staff.findMany({
      where: { Id: { not: "PENDING" } },
      orderBy: { Name: "asc" },
    });
    return staffSimple.map((s) => mapStaffToUI({ ...s, StaffLicense: [], Visit: [] }));
  }
}

export async function getStaffById(id: string) {
  if (id === "PENDING") return null;
  try {
    const s = await db.staff.findUnique({
      where: { Id: id },
      include: { StaffLicense: true, Visit: true },
    });
    if (!s) return null;
    const ui = mapStaffToUI(s);
    const activeVisits = (s.Visit || []).filter((v: any) => {
      const st = (v.Status || "").toUpperCase();
      return BUSY_VISIT_STATUSES.includes(st) && isTodayVisit(v);
    });
    if (activeVisits.length > 0 && ui.status !== "Nghỉ phép") {
      ui.status = "Đang bận";
      ui.available = false;
    }
    (ui as any).activeVisitCount = activeVisits.length;
    return ui;
  } catch (err: any) {
    console.error("Error in getStaffById:", err);
    const s = await db.staff.findUnique({ where: { Id: id } });
    if (!s) return null;
    return mapStaffToUI({ ...s, StaffLicense: [], Visit: [] });
  }
}

export async function createStaff(data: z.infer<typeof staffSchema>) {
  const validated = staffSchema.parse(data);

  // Kiểm tra trùng trước khi tạo chuyên gia/nhân viên
  await assertNoDuplicate({
    model: "staff",
    checks: [
      { field: "Id", value: validated.id, fieldDisplayName: "Mã nhân viên" },
      ...(validated.email && validated.email !== "unknown@mintcare.com"
        ? [{ field: "Email", value: validated.email, fieldDisplayName: "Gmail" }]
        : []),
      ...(validated.phone && validated.phone !== "0000000000"
        ? [{ field: "Phone", value: validated.phone, fieldDisplayName: "Số điện thoại" }]
        : []),
    ],
  });

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
  if (rest.experience !== undefined) dbData.Experience = rest.experience || null;
  if (rest.specialty !== undefined) dbData.Specialty = rest.specialty || null;
  if ((rest as any).staffType !== undefined) dbData.StaffType = (rest as any).staffType || null;

  // Chỉ khóa nếu nhân sự đang có ca trực ở trạng thái "Đã xác nhận" / "Đang thực hiện" TRONG NGÀY HÔM NAY
  const staffWithVisits = await db.staff.findUnique({
    where: { Id: id },
    include: { Visit: true },
  });
  const activeVisitsToday = (staffWithVisits?.Visit || []).filter((v: any) => {
    const st = (v.Status || "").toUpperCase();
    return BUSY_VISIT_STATUSES.includes(st) && isTodayVisit(v);
  });

  if (activeVisitsToday.length > 0) {
    if (dbData.Status === "Sẵn sàng") {
      throw new Error(`🔒 Không thể chuyển sang "Sẵn sàng" vì chuyên gia đang có ${activeVisitsToday.length} ca trực Đã xác nhận trong ngày hôm nay!`);
    }
    if (dbData.Status === "Nghỉ phép") {
      throw new Error(`🔒 Không thể chuyển sang "Nghỉ phép" vì chuyên gia đang có ${activeVisitsToday.length} ca trực Đã xác nhận trong ngày hôm nay!`);
    }
  }

  // Kiểm tra trùng Gmail/Phone với nhân viên khác khi cập nhật
  const emailToCheck = rest.email;
  const phoneToCheck = rest.phone;

  await assertNoDuplicate({
    model: "staff",
    checks: [
      ...(emailToCheck && emailToCheck !== "unknown@mintcare.com"
        ? [{ field: "Email", value: emailToCheck, fieldDisplayName: "Gmail" }]
        : []),
      ...(phoneToCheck && phoneToCheck !== "0000000000"
        ? [{ field: "Phone", value: phoneToCheck, fieldDisplayName: "Số điện thoại" }]
        : []),
    ],
    excludeId: { field: "Id", value: id },
  });

  const updated = await db.staff.update({
    where: { Id: id },
    data: dbData,
    include: { StaffLicense: true },
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
