import { Router } from "express";
import {
  getVisitList,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
  syncPatientsForVisits,
} from "../services/visit";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId =
      typeof req.query.userId === "string" ? req.query.userId : undefined;
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const paymentStatus =
      typeof req.query.paymentStatus === "string"
        ? req.query.paymentStatus
        : undefined;
    const visits = await getVisitList(userId, status, paymentStatus);
    res.json(visits);
  } catch (error: any) {
    console.error("Visits route error:", error);
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Sync: tạo Patient cho tất cả visit "Đã xác nhận" chưa có patient
router.post("/sync-patients", async (req, res) => {
  try {
    const count = await syncPatientsForVisits();
    res.json({ message: `Đã đồng bộ ${count} bệnh nhân từ lịch hẹn.`, count });
  } catch (error: any) {
    console.error("Sync patients error:", error);
    res.status(500).json({ error: error.message || "Lỗi đồng bộ" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newVisit = await createVisit(req.body);
    res.status(201).json(newVisit);
  } catch (error: any) {
    console.error("Visits POST error:", error);
    const status = error?.statusCode || 500;
    res.status(status).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const visit = await getVisitById(req.params.id);
    if (!visit) {
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn" });
    }
    res.json(visit);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await updateVisit(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteVisit(req.params.id);
    res.json({ message: "Xóa lịch hẹn thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;
