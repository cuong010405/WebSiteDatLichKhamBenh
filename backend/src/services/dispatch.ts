import { db } from "../db";

function parseTimeMinutes(t?: string | null): number {
  if (!t || !t.includes(":")) return 0;
  const [h, m] = t.split(":").map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

function isTimeOverlap(
  start1?: string | null,
  end1?: string | null,
  start2?: string | null,
  end2?: string | null
): boolean {
  if (!start1 || !end1 || !start2 || !end2) return false;
  const s1 = parseTimeMinutes(start1);
  const e1 = parseTimeMinutes(end1);
  const s2 = parseTimeMinutes(start2);
  const e2 = parseTimeMinutes(end2);
  if (s1 === 0 || e1 === 0 || s2 === 0 || e2 === 0) return false;
  return s1 < e2 && s2 < e1;
}

/**
 * Score how well a staff member matches the request.
 * Higher = better.
 */
function scoreStaff(
  staff: {
    Specialty?: string | null;
    ServiceArea?: string | null;
    Location: string;
    Department: string;
  },
  requiredSpecialty: string,
  customerArea: string,
): number {
  let score = 0;

  // 1. Specialty match (most important)
  if (requiredSpecialty && staff.Specialty) {
    const spec = staff.Specialty.toLowerCase();
    const req = requiredSpecialty.toLowerCase();
    if (spec.includes(req) || req.includes(spec)) score += 50;
  }

  // 2. ServiceArea / Location match
  const area = customerArea.toLowerCase();
  if (staff.ServiceArea) {
    const svcArea = staff.ServiceArea.toLowerCase();
    const areaParts = area.split(",").map((p) => p.trim());
    for (const part of areaParts) {
      if (part && svcArea.includes(part)) {
        score += 30;
        break;
      }
    }
  }
  if (staff.Location && area.includes(staff.Location.toLowerCase())) {
    score += 20;
  }

  return score;
}

/**
 * Auto-assign the best available staff member to a visit.
 * Excludes busy staff members and staff members with time conflicts.
 */
export async function autoAssignStaff(params: {
  visitId: string;
  date?: string;
  requiredSpecialty?: string;
  customerArea?: string;
}): Promise<{ staffId: string; staffName: string } | null> {
  const { visitId } = params;

  const targetVisit = await db.visit.findUnique({ where: { Id: visitId } });
  if (!targetVisit) return null;

  const date = params.date || targetVisit.Date || new Date().toISOString().split("T")[0];
  const requiredSpecialty = params.requiredSpecialty || targetVisit.RequiredSpecialty || "";
  const customerArea = params.customerArea || targetVisit.CustomerArea || "";
  const startTime = targetVisit.StartTime || (targetVisit.Time ? targetVisit.Time.split("-")[0]?.trim() : null);
  const endTime = targetVisit.EndTime || (targetVisit.Time ? targetVisit.Time.split("-")[1]?.trim() : null);

  // 1. Get all active staff excluding PENDING
  const allStaff = await db.staff.findMany({
    where: { Available: true, Status: "Sẵn sàng", Id: { not: "PENDING" } },
    select: {
      Id: true,
      Name: true,
      Specialty: true,
      ServiceArea: true,
      Location: true,
      Department: true,
      MaxDailyVisits: true,
    },
  });

  if (allStaff.length === 0) return null;

  // 2. Fetch existing active visits on that date
  const existingVisits = await db.visit.findMany({
    where: { Date: date, Status: { not: "Đã hủy" }, Id: { not: visitId } },
    select: { StaffId: true, StartTime: true, EndTime: true, Time: true },
  });

  const visitCountMap = new Map<string, number>();
  const staffVisitsMap = new Map<string, any[]>();

  for (const v of existingVisits) {
    if (!v.StaffId || v.StaffId === "PENDING") continue;
    visitCountMap.set(v.StaffId, (visitCountMap.get(v.StaffId) ?? 0) + 1);
    if (!staffVisitsMap.has(v.StaffId)) staffVisitsMap.set(v.StaffId, []);
    staffVisitsMap.get(v.StaffId)!.push(v);
  }

  // 3. Filter eligible staff: under daily limit AND no time conflict
  const eligible = allStaff.filter((s) => {
    const count = visitCountMap.get(s.Id) ?? 0;
    if (count >= (s.MaxDailyVisits ?? 3)) return false;

    // Check time conflict
    const staffVisits = staffVisitsMap.get(s.Id) || [];
    for (const sv of staffVisits) {
      const svStart = sv.StartTime || (sv.Time ? sv.Time.split("-")[0]?.trim() : null);
      const svEnd = sv.EndTime || (sv.Time ? sv.Time.split("-")[1]?.trim() : null);
      if (isTimeOverlap(startTime, endTime, svStart, svEnd)) {
        return false; // Time conflict detected!
      }
    }
    return true;
  });

  if (eligible.length === 0) return null;

  // 4. Score and pick best match
  const scored = eligible
    .map((s) => ({
      ...s,
      score: scoreStaff(s, requiredSpecialty, customerArea),
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  // 5. Update Visit with assigned staff
  await db.visit.update({
    where: { Id: visitId },
    data: {
      StaffId: best.Id,
      Status: "Đang thực hiện",
      AssignedAt: new Date(),
    },
  });

  return { staffId: best.Id, staffName: best.Name };
}

/**
 * Get available staff with conflict checks & match scores for Admin dispatch panel.
 */
export async function getAvailableStaff(params: {
  date: string;
  visitId?: string;
  requiredSpecialty?: string;
  customerArea?: string;
}) {
  const { date, visitId, requiredSpecialty = "", customerArea = "" } = params;

  let startTime: string | null = null;
  let endTime: string | null = null;

  if (visitId) {
    const target = await db.visit.findUnique({ where: { Id: visitId } });
    if (target) {
      startTime = target.StartTime || (target.Time ? target.Time.split("-")[0]?.trim() : null);
      endTime = target.EndTime || (target.Time ? target.Time.split("-")[1]?.trim() : null);
    }
  }

  const allStaff = await db.staff.findMany({
    where: { Available: true, Id: { not: "PENDING" } },
    select: {
      Id: true,
      Name: true,
      Role: true,
      Department: true,
      Specialty: true,
      ServiceArea: true,
      Location: true,
      Avatar: true,
      MaxDailyVisits: true,
    },
  });

  const existingVisits = await db.visit.findMany({
    where: { Date: date, Status: { not: "Đã hủy" }, ...(visitId ? { Id: { not: visitId } } : {}) },
    select: { StaffId: true, StartTime: true, EndTime: true, Time: true },
  });

  const busyMap = new Map<string, number>();
  const staffVisitsMap = new Map<string, any[]>();

  for (const v of existingVisits) {
    if (!v.StaffId || v.StaffId === "PENDING") continue;
    busyMap.set(v.StaffId, (busyMap.get(v.StaffId) ?? 0) + 1);
    if (!staffVisitsMap.has(v.StaffId)) staffVisitsMap.set(v.StaffId, []);
    staffVisitsMap.get(v.StaffId)!.push(v);
  }

  return allStaff
    .map((s) => {
      const currentVisits = busyMap.get(s.Id) ?? 0;
      const maxDailyVisits = s.MaxDailyVisits ?? 3;
      const isDailyFull = currentVisits >= maxDailyVisits;

      // Time overlap check
      let hasConflict = false;
      if (startTime && endTime) {
        const staffVisits = staffVisitsMap.get(s.Id) || [];
        for (const sv of staffVisits) {
          const svStart = sv.StartTime || (sv.Time ? sv.Time.split("-")[0]?.trim() : null);
          const svEnd = sv.EndTime || (sv.Time ? sv.Time.split("-")[1]?.trim() : null);
          if (isTimeOverlap(startTime, endTime, svStart, svEnd)) {
            hasConflict = true;
            break;
          }
        }
      }

      const isAvailable = !isDailyFull && !hasConflict;
      let conflictReason: string | null = null;
      if (hasConflict) conflictReason = "Trùng ca/giờ khám khác";
      else if (isDailyFull) conflictReason = "Đã đủ 3 ca/ngày";

      return {
        id: s.Id,
        name: s.Name,
        role: s.Role,
        department: s.Department,
        specialty: s.Specialty,
        serviceArea: s.ServiceArea,
        location: s.Location,
        avatar: s.Avatar,
        currentVisits,
        maxDailyVisits,
        hasConflict,
        isFull: isDailyFull || hasConflict,
        conflictReason,
        isAvailable,
        score: scoreStaff(s, requiredSpecialty, customerArea),
      };
    })
    .sort((a, b) => (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0) || b.score - a.score);
}

/**
 * Manually assign a specific staff to a visit (admin action).
 */
export async function manualAssignStaff(visitId: string, staffId: string, status?: string) {
  const staff = await db.staff.findUnique({
    where: { Id: staffId },
    select: { Id: true, Name: true },
  });
  if (!staff) throw new Error("Nhân viên không tồn tại");

  const updateData: any = { StaffId: staffId, AssignedAt: new Date() };
  if (status) {
    updateData.Status = status;
  }

  await db.visit.update({
    where: { Id: visitId },
    data: updateData,
  });

  return { staffId: staff.Id, staffName: staff.Name };
}
