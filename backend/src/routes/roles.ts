import { Router } from "express";
import {
  getRoleList,
  getActiveRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../services/role";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Public: get all roles (for forms)
router.get("/", async (_req, res) => {
  try {
    const roles = await getRoleList();
    res.json(roles);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Public: get only active roles
router.get("/active", async (_req, res) => {
  try {
    const roles = await getActiveRoles();
    res.json(roles);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Public: get role by id
router.get("/:id", async (req, res) => {
  try {
    const role = await getRoleById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: "Không tìm thấy chức vụ" });
    }
    res.json(role);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Admin: create role
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const newRole = await createRole(req.body);
    res.status(201).json(newRole);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// Admin: update role
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await updateRole(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// Admin: delete role
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await deleteRole(req.params.id);
    res.json({ message: "Xóa chức vụ thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;
