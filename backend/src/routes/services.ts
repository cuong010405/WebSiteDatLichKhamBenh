import { Router } from "express";
import {
  getServiceList,
  getActiveServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../services/service";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Public: get all services (for booking form)
router.get("/", async (_req, res) => {
  try {
    const services = await getServiceList();
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Public: get only active services
router.get("/active", async (_req, res) => {
  try {
    const services = await getActiveServices();
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Admin: create service
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const newService = await createService(req.body);
    res.status(201).json(newService);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// Public: get service by id
router.get("/:id", async (req, res) => {
  try {
    const service = await getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Không tìm thấy dịch vụ" });
    }
    res.json(service);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Admin: update service
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await updateService(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// Admin: delete service
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await deleteService(req.params.id);
    res.json({ message: "Xóa dịch vụ thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;
