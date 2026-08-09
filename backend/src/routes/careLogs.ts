import { Router } from "express";
import { getCareLogsByPatient, createCareLog, updateCareLog, deleteCareLog } from "../services/careLog";
import { requireAuth, requireAdmin, getStaffIdForUser } from "../middleware/auth";
import { db } from "../db";

const router = Router();

/**
 * Check if a staff member is assigned to a patient via PatientStaff or Visit tables.
 */
async function isStaffAssignedToPatient(staffId: string, patientId: string): Promise<boolean> {
  const link = await db.patientStaff.findFirst({
    where: { PatientId: patientId, StaffId: staffId },
  });
  if (link) return true;

  const visit = await db.visit.findFirst({
    where: { StaffId: staffId, PatientId: patientId },
  });
  return !!visit;
}

// GET care logs for patient — staff can only access assigned patients
router.get("/patient/:patientId", requireAuth, async (req, res) => {
  try {
    const authUser = req.authUser!;
    const patientId = req.params.patientId;

    if (authUser.role === "vltl" || authUser.role === "chuyen_gia" || authUser.role === "dieu_duong") {
      const staffId = await getStaffIdForUser(authUser);
      if (!staffId || !(await isStaffAssignedToPatient(staffId, patientId))) {
        return res.status(403).json({ error: "Không có quyền xem nhật ký của bệnh nhân này" });
      }
    }

    const logs = await getCareLogsByPatient(patientId);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// POST create care log — admin + staff for assigned patients
router.post("/", requireAuth, async (req, res) => {
  try {
    const authUser = req.authUser!;

    if (authUser.role === "vltl" || authUser.role === "chuyen_gia" || authUser.role === "dieu_duong") {
      const staffId = await getStaffIdForUser(authUser);
      if (!staffId || !(await isStaffAssignedToPatient(staffId, req.body.patientId))) {
        return res.status(403).json({ error: "Bạn chỉ có thể tạo nhật ký cho bệnh nhân được phân công" });
      }
    } else if (authUser.role !== "admin") {
      return res.status(403).json({ error: "Không có quyền tạo nhật ký chăm sóc" });
    }

    const newLog = await createCareLog(req.body);
    res.status(201).json(newLog);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// PUT update care log — admin + staff who created / is assigned
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const authUser = req.authUser!;

    if (authUser.role === "vltl" || authUser.role === "chuyen_gia" || authUser.role === "dieu_duong") {
      const staffId = await getStaffIdForUser(authUser);
      // Check the existing care log belongs to this staff's patient
      const existingLog = await db.careLog.findUnique({ where: { Id: req.params.id } });
      if (!existingLog) {
        return res.status(404).json({ error: "Không tìm thấy nhật ký" });
      }
      if (!staffId || !(await isStaffAssignedToPatient(staffId, existingLog.PatientId))) {
        return res.status(403).json({ error: "Bạn chỉ có thể sửa nhật ký cho bệnh nhân được phân công" });
      }
    } else if (authUser.role !== "admin") {
      return res.status(403).json({ error: "Không có quyền chỉnh sửa nhật ký" });
    }

    const updated = await updateCareLog(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// DELETE care log — admin only
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await deleteCareLog(req.params.id);
    res.json({ message: "Xóa nhật ký chăm sóc thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;

