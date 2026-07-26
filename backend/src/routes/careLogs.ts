import { Router } from "express";
import { getCareLogsByPatient, createCareLog, deleteCareLog } from "../services/careLog";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET care logs for patient
router.get("/patient/:patientId", async (req, res) => {
  try {
    const logs = await getCareLogsByPatient(req.params.patientId);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// POST create care log
router.post("/", requireAuth, async (req, res) => {
  try {
    const newLog = await createCareLog(req.body);
    res.status(201).json(newLog);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// DELETE care log
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await deleteCareLog(req.params.id);
    res.json({ message: "Xóa nhật ký chăm sóc thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;
