import { Router } from "express";
import { db } from "../db";
import {
  getVisitList,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
  syncPatientsForVisits,
} from "../services/visit";
import { requireAuth, requireAdmin } from "../middleware/auth";

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
router.post("/sync-patients", requireAuth, requireAdmin, async (req, res) => {
  try {
    const count = await syncPatientsForVisits();
    res.json({ message: `Đã đồng bộ ${count} bệnh nhân từ lịch hẹn.`, count });
  } catch (error: any) {
    console.error("Sync patients error:", error);
    res.status(500).json({ error: error.message || "Lỗi đồng bộ" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const newVisit = await createVisit(req.body);
    res.status(201).json(newVisit);
  } catch (error: any) {
    console.error("Visits POST error:", error);
    const isNotFound = error.message?.includes("không tồn tại");
    res.status(isNotFound ? 404 : 400).json({ error: error.message || "Yêu cầu không hợp lệ" });
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

// Customer cancel endpoint with reason and notification to Admin
router.post("/:id/cancel", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { reason, note } = req.body;

  if (!reason) {
    return res.status(400).json({ error: "Vui lòng chọn lý do hủy lịch hẹn" });
  }

  try {
    const visit = await db.visit.findUnique({
      where: { Id: id },
      include: { User: true },
    });

    if (!visit) {
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn" });
    }

    // Rule: Admin confirmed/ongoing/completed visits cannot be canceled
    if (visit.Status && visit.Status !== "Chờ duyệt") {
      return res.status(400).json({
        error: "Lịch hẹn đã được Admin duyệt hoặc xác nhận, không thể hủy!",
      });
    }

    const fullReason = note?.trim() ? `${reason} (${note.trim()})` : reason;

    const updated = await db.visit.update({
      where: { Id: id },
      data: {
        Status: "Đã hủy",
        PaymentNote: `Lý do hủy: ${fullReason}`,
      },
    });

    // Send Activity Log / Notification to Admin
    const customerName = visit.User?.FullName || "Khách hàng";

    // 1) Ghi vào bảng Notification (SQL) — lưu thông báo từ khách hàng
    try {
      await db.notification.create({
        data: {
          Id: `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          UserId: visit.UserId ?? null,
          VisitId: visit.Id,
          Type: "CANCEL_VISIT",
          Title: `Khách hàng hủy lịch hẹn #${visit.Id}`,
          Message: `Khách hàng "${customerName}" đã hủy lịch hẹn #${visit.Id} (${visit.Type || "Khám bệnh"}). Lý do: ${fullReason}`,
          IsRead: false,
        },
      });
    } catch (notifErr) {
      console.warn("Lỗi tạo Notification:", notifErr);
    }

    // 2) Ghi vào bảng ActivityLog (hiển thị tại trang Dashboard admin)
    try {
      await db.activityLog.create({
        data: {
          Id: `log-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          Status: "review",
          Title: `Khách hàng hủy lịch hẹn #${visit.Id}`,
          Desc: `Khách hàng "${customerName}" đã hủy lịch hẹn #${visit.Id} (${visit.Type || "Khám bệnh"}). Lý do: ${fullReason}`,
          Time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          Color: "bg-amber-500",
        },
      });
    } catch (logErr) {
      console.warn("Lỗi tạo ActivityLog:", logErr);
    }

    return res.json({
      message: "Hủy lịch hẹn thành công",
      visit: updated,
    });
  } catch (error: any) {
    console.error("Cancel visit error:", error);
    return res.status(500).json({ error: error.message || "Lỗi hủy lịch hẹn" });
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await updateVisit(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await getVisitById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn" });
    }
    await deleteVisit(req.params.id);
    res.json({ message: "Xóa lịch hẹn thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;
