import { Router } from "express";
import { getStaffList, getStaffById, createStaff, updateStaff, deleteStaff } from "../services/staff";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const staff = await getStaffList();
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newStaff = await createStaff(req.body);
    res.status(201).json(newStaff);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const staffMember = await getStaffById(req.params.id);
    if (!staffMember) {
      return res.status(404).json({ error: "Không tìm thấy nhân viên" });
    }
    res.json(staffMember);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await updateStaff(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteStaff(req.params.id);
    res.json({ message: "Xóa nhân viên thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;
