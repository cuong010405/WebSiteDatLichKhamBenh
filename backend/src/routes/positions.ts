import { Router } from "express";
import {
  getPositionList,
  getActivePositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
} from "../services/position";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Public: get all positions (for forms)
router.get("/", async (_req, res) => {
  try {
    const positions = await getPositionList();
    res.json(positions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Public: get only active positions
router.get("/active", async (_req, res) => {
  try {
    const positions = await getActivePositions();
    res.json(positions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Public: get position by id
router.get("/:id", async (req, res) => {
  try {
    const position = await getPositionById(req.params.id);
    if (!position) {
      return res.status(404).json({ error: "Không tìm thấy chức vụ" });
    }
    res.json(position);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Admin: create position
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const newPosition = await createPosition(req.body);
    res.status(201).json(newPosition);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// Admin: update position
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await updatePosition(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// Admin: delete position
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await deletePosition(req.params.id);
    res.json({ message: "Xóa chức vụ thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;
