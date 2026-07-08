import { Router, Request, Response } from "express";
import {
  getPaymentList,
  getPaymentById,
  createPayment,
  deletePayment,
} from "../services/payment";

const router = Router();

// GET /api/payments
router.get("/", async (_req: Request, res: Response) => {
  try {
    const payments = await getPaymentList();
    res.json(payments);
  } catch (err: any) {
    console.error("GET /api/payments error:", err);
    res.status(500).json({ error: "Lỗi lấy danh sách hóa đơn" });
  }
});

// GET /api/payments/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const payment = await getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Không tìm thấy hóa đơn" });
    res.json(payment);
  } catch (err: any) {
    console.error("GET /api/payments/:id error:", err);
    res.status(500).json({ error: "Lỗi lấy thông tin hóa đơn" });
  }
});

// POST /api/payments
router.post("/", async (req: Request, res: Response) => {
  const { visitId, userId, amount, method, note } = req.body;

  // Validate required fields
  if (!visitId || !amount || !method) {
    return res.status(400).json({ error: "visitId, amount và method là bắt buộc" });
  }
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: "Số tiền thanh toán không hợp lệ" });
  }

  try {
    const payment = await createPayment({ visitId, userId, amount, method, note });
    res.status(201).json(payment);
  } catch (err: any) {
    console.error("POST /api/payments error:", err);
    res.status(500).json({ error: err.message || "Lỗi tạo hóa đơn" });
  }
});

// DELETE /api/payments/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await deletePayment(req.params.id);
    res.json(result);
  } catch (err: any) {
    console.error("DELETE /api/payments/:id error:", err);
    const status = err.message?.includes("Không tìm thấy") ? 404 : 500;
    res.status(status).json({ error: err.message || "Lỗi xóa hóa đơn" });
  }
});

export default router;
