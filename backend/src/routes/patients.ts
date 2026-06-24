import { Router } from "express";
import { getPatientList, getPatientById, createPatient, updatePatient, deletePatient } from "../services/patient";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const patients = await getPatientList();
    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newPatient = await createPatient(req.body);
    res.status(201).json(newPatient);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const patient = await getPatientById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Không tìm thấy bệnh nhân" });
    }
    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await updatePatient(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deletePatient(req.params.id);
    res.json({ message: "Xóa bệnh nhân thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;
