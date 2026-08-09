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
import { requireAuth, requireAdmin, optionalAuth, getStaffIdForUser } from "../middleware/auth";

const router = Router();

// GET /api/visits - Get visits according to user role or query params
router.get("/", optionalAuth, async (req, res) => {
  try {
    const authUser = req.authUser;
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const paymentStatus =
      typeof req.query.paymentStatus === "string"
        ? req.query.paymentStatus
        : undefined;

    let targetUserId: string | undefined = undefined;
    let targetStaffId: string | undefined = undefined;

    if (authUser) {
      if (authUser.role === "admin") {
        targetUserId = typeof req.query.userId === "string" ? req.query.userId : undefined;
        targetStaffId = typeof req.query.staffId === "string" ? req.query.staffId : undefined;
      } else if (authUser.role === "vltl" || authUser.role === "chuyen_gia" || authUser.role === "dieu_duong") {
        const staffId = await getStaffIdForUser(authUser);
        if (!staffId) {
          return res.json([]);
        }
        targetStaffId = staffId;
      } else {
        // customer role
        targetUserId = authUser.id;
      }
    } else {
      // Unauthenticated request (e.g., customer page fetching by userId)
      if (typeof req.query.userId === "string" && req.query.userId.trim()) {
        targetUserId = req.query.userId.trim();
      } else {
        // No auth and no userId -> return empty to avoid leaking all bookings
        return res.json([]);
      }
    }

    const visits = await getVisitList(targetUserId, status, paymentStatus, targetStaffId);
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
    const authUser = req.authUser!;
    // For non-admin customers, set UserId to authUser.id for security
    const body = { ...req.body };
    if (authUser.role === "customer") {
      body.userId = authUser.id;
    }
    const newVisit = await createVisit(body);
    res.status(201).json(newVisit);
  } catch (error: any) {
    console.error("Visits POST error:", error);
    const isNotFound = error.message?.includes("không tồn tại");
    res.status(isNotFound ? 404 : 400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const authUser = req.authUser!;
    const visit = await getVisitById(req.params.id);
    if (!visit) {
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn" });
    }

    // Ownership / Role Check
    if (authUser.role === "customer" && visit.userId !== authUser.id) {
      return res.status(403).json({ error: "Không có quyền xem lịch hẹn của người khác" });
    }
    if (authUser.role === "chuyen_gia" || authUser.role === "dieu_duong") {
      const staffId = await getStaffIdForUser(authUser);
      if (!staffId || visit.staffId !== staffId) {
        return res.status(403).json({ error: "Không có quyền xem lịch hẹn không thuộc công tác của bạn" });
      }
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
  const authUser = req.authUser!;

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

    // Ownership check for customers
    if (authUser.role === "customer" && visit.UserId !== authUser.id) {
      return res.status(403).json({ error: "Không có quyền hủy lịch hẹn này" });
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

    const customerName = visit.User?.FullName || "Khách hàng";

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

// Update visit status / assignment
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const authUser = req.authUser!;
    const existing = await getVisitById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn" });
    }

    // Role permission check: Staff can only update status for their own visits
    if (authUser.role === "chuyen_gia" || authUser.role === "dieu_duong") {
      const staffId = await getStaffIdForUser(authUser);
      if (!staffId || existing.staffId !== staffId) {
        return res.status(403).json({ error: "Bạn chỉ có thể cập nhật ca được phân công cho mình" });
      }
      // Restrict fields staff can update
      const allowedUpdate = {
        status: req.body.status ?? existing.status,
        paymentNote: req.body.paymentNote ?? (existing as any).paymentNote,
      };
      const updated = await updateVisit(req.params.id, allowedUpdate);
      return res.json(updated);
    }

    // Admin can update anything
    if (authUser.role === "admin") {
      const updated = await updateVisit(req.params.id, req.body);
      return res.json(updated);
    }

    return res.status(403).json({ error: "Không có quyền cập nhật lịch hẹn" });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// DELETE visit - Admin only
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
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
