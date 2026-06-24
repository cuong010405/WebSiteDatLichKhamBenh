import { Router } from "express";
import { getActivityLogs, createActivityLog } from "../services/log";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const logs = await getActivityLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Lỗi máy chủ nội bộ" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newLog = await createActivityLog(req.body);
    res.status(201).json(newLog);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Yêu cầu không hợp lệ" });
  }
});

export default router;
