import { Router } from "express";
import {
  getServiceTypeList,
  getActiveServiceTypes,
  getServiceTypeById,
  createServiceType,
  updateServiceType,
  deleteServiceType,
} from "../services/serviceType";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Public: get all service types
router.get("/", async (_req, res) => {
  try {
    const types = await getServiceTypeList();
    res.json(types);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Public: get only active service types
router.get("/active", async (_req, res) => {
  try {
    const types = await getActiveServiceTypes();
    res.json(types);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Public: get service type by id
router.get("/:id", async (req, res) => {
  try {
    const type = await getServiceTypeById(req.params.id);
    if (!type) {
      return res.status(404).json({ error: "Không tìm thấy loại dịch vụ" });
    }
    res.json(type);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Admin: create service type
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const newType = await createServiceType(req.body);
    res.status(201).json(newType);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// Admin: update service type
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await updateServiceType(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// Admin: delete service type
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await deleteServiceType(req.params.id);
    res.json({ message: "Xóa loại dịch vụ thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;
