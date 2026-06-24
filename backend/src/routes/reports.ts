import { Router } from "express";
import { getReportData } from "../services/visit";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const reportData = await getReportData();
    res.json(reportData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

export default router;
