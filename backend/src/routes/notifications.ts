import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import {
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from "../services/notification";

const router = Router();

// GET /api/notifications — Admin: lấy tất cả; Customer: lấy của mình
router.get("/", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.role === "admin" ? undefined : req.user?.id;
    const notifications = await getNotifications(userId);
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ" });
  }
});

// GET /api/notifications/unread-count
router.get("/unread-count", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.role === "admin" ? undefined : req.user?.id;
    const count = await getUnreadCount(userId);
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications — Tạo thông báo mới
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const { userId, visitId, type, title, message } = req.body;
    if (!type || !title || !message) {
      return res.status(400).json({ error: "Thiếu trường bắt buộc: type, title, message" });
    }
    const notif = await createNotification({ userId, visitId, type, title, message });
    res.status(201).json(notif);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/notifications/:id/read — Đánh dấu đã đọc
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    await markNotificationRead(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/notifications/mark-all-read — Đánh dấu tất cả đã đọc
router.patch("/mark-all-read", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.role === "admin" ? undefined : req.user?.id;
    await markAllNotificationsRead(userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
