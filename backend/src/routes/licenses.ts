import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import {
  getLicensesByStaffId,
  createLicense,
  updateLicense,
  deleteLicense,
} from "../services/license";

const router = Router();

// GET /api/licenses/:staffId — public (customer page needs this)
router.get("/:staffId", async (req, res) => {
  try {
    const licenses = await getLicensesByStaffId(req.params.staffId);
    res.json(licenses);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

// POST /api/licenses — admin only
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { staffId, licenseNumber, issuedBy, issuedDate, expiryDate, specialty, note } = req.body;
    if (!staffId || !licenseNumber || !issuedBy || !issuedDate) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }
    const license = await createLicense({ staffId, licenseNumber, issuedBy, issuedDate, expiryDate, specialty, note });
    res.status(201).json(license);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// PUT /api/licenses/:id — admin only
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await updateLicense(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

// DELETE /api/licenses/:id — admin only
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await deleteLicense(req.params.id);
    res.json({ message: "Đã xóa chứng chỉ" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;
