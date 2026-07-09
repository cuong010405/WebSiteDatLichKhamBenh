import { Router } from "express";
import {
  getDepartmentList,
  getActiveDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/department";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Public: get all departments (for forms)
router.get("/", async (_req, res) => {
  try {
    const departments = await getDepartmentList();
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Public: get only active departments
router.get("/active", async (_req, res) => {
  try {
    const departments = await getActiveDepartments();
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Public: get department by id
router.get("/:id", async (req, res) => {
  try {
    const department = await getDepartmentById(req.params.id);
    if (!department) {
      return res.status(404).json({ error: "Không tìm thấy phòng ban" });
    }
    res.json(department);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// Admin: create department
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const newDepartment = await createDepartment(req.body);
    res.status(201).json(newDepartment);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// Admin: update department
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await updateDepartment(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// Admin: delete department
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await deleteDepartment(req.params.id);
    res.json({ message: "Xóa phòng ban thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;
