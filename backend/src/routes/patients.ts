import { Router } from "express";
import { getPatientList, getPatientById, createPatient, updatePatient, deletePatient } from "../services/patient";
import { requireAuth, requireAdmin, getStaffIdForUser } from "../middleware/auth";
import { db } from "../db";

const router = Router();

// GET /api/patients — Admin sees all, staff sees assigned patients only
router.get("/", requireAuth, async (req, res) => {
  try {
    const authUser = req.authUser!;

    if (authUser.role === "admin") {
      const patients = await getPatientList();
      return res.json(patients);
    }

    const staffId = await getStaffIdForUser(authUser);
    if (staffId) {
      // Find all patient IDs linked to this staff via PatientStaff or Visit
      const patientStaffLinks = await db.patientStaff.findMany({
        where: { StaffId: staffId },
        select: { PatientId: true },
      });
      const visitLinks = await db.visit.findMany({
        where: { StaffId: staffId, PatientId: { not: null } },
        select: { PatientId: true },
      });

      const patientIds = Array.from(new Set([
        ...patientStaffLinks.map(l => l.PatientId),
        ...visitLinks.map(l => l.PatientId).filter(Boolean) as string[],
      ]));

      if (patientIds.length === 0) return res.json([]);

      const patients = await db.patient.findMany({
        where: { Id: { in: patientIds } },
        include: {
          PatientStaff: { select: { StaffId: true } },
        },
        orderBy: { Name: "asc" },
      });

      const mapped = patients.map(p => ({
        id: p.Id,
        name: p.Name,
        age: p.Age,
        gender: p.Gender,
        lastVisit: p.LastVisit,
        lastVisitTime: p.LastVisitTime,
        status: p.Status,
        summary: p.Summary,
        assignedStaff: p.PatientStaff.map(ps => ps.StaffId),
      }));

      return res.json(mapped);
    }

    return res.json([]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// POST — Admin only
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const newPatient = await createPatient(req.body);
    res.status(201).json(newPatient);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// GET single patient
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const authUser = req.authUser!;
    const patient = await getPatientById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Không tìm thấy bệnh nhân" });
    }

    // Staff can only view assigned patients
    if (authUser.role === "vltl" || authUser.role === "chuyen_gia" || authUser.role === "dieu_duong") {
      const staffId = await getStaffIdForUser(authUser);
      if (!staffId) return res.status(403).json({ error: "Không có quyền xem bệnh nhân này" });

      const link = await db.patientStaff.findFirst({
        where: { PatientId: req.params.id, StaffId: staffId },
      });
      const visitLink = await db.visit.findFirst({
        where: { StaffId: staffId, PatientId: req.params.id },
      });
      if (!link && !visitLink) {
        return res.status(403).json({ error: "Không có quyền xem bệnh nhân không thuộc phạm vi phụ trách" });
      }
    }

    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// PUT — Admin only
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await updatePatient(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// DELETE — Admin only
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await deletePatient(req.params.id);
    res.json({ message: "Xóa bệnh nhân thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;

