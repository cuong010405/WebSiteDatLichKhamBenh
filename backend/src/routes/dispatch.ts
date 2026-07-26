import { Router, Request, Response } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import {
  autoAssignStaff,
  getAvailableStaff,
  manualAssignStaff,
} from "../services/dispatch";
import { db } from "../db";

const router = Router();

/**
 * GET /api/dispatch/available
 * List available staff for a given date/specialty/area
 * Admin only
 */
router.get(
  "/available",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { date, specialty, area } = req.query as Record<string, string>;
    if (!date) {
      res.status(400).json({ error: "Thiếu tham số date" });
      return;
    }
    try {
      const staff = await getAvailableStaff({
        date,
        requiredSpecialty: specialty,
        customerArea: area,
      });
      res.json(staff);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * GET /api/dispatch/pending
 * List visits that have not been assigned yet (StaffId = 'PENDING')
 * Admin only
 */
router.get(
  "/pending",
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const visits = await db.visit.findMany({
        where: { StaffId: "PENDING" },
        include: {
          User: { select: { FullName: true, Phone: true, Address: true } },
        },
        orderBy: { Id: "desc" },
      });
      res.json(
        visits.map((v) => ({
          id: v.Id,
          type: v.Type,
          date: v.Date,
          time: v.Time,
          customerArea: v.CustomerArea,
          requiredSpecialty: v.RequiredSpecialty,
          careMode: v.CareMode,
          packagePlan: v.PackagePlan,
          packageShift: v.PackageShift,
          paymentAmount: v.PaymentAmount,
          status: v.Status,
          userName: v.User?.FullName ?? "",
          userPhone: v.User?.Phone ?? "",
          userAddress: v.User?.Address ?? v.CustomerArea ?? "",
        })),
      );
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * POST /api/dispatch/assign/:visitId
 * Auto-assign best staff to a visit
 * Admin only
 */
router.post(
  "/assign/:visitId",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { visitId } = req.params;
    try {
      const visit = await db.visit.findUnique({ where: { Id: visitId } });
      if (!visit) {
        res.status(404).json({ error: "Lịch hẹn không tồn tại" });
        return;
      }
      const result = await autoAssignStaff({
        visitId,
        date: visit.Date ?? new Date().toLocaleDateString("vi-VN"),
        requiredSpecialty: visit.RequiredSpecialty ?? "",
        customerArea: visit.CustomerArea ?? "",
      });
      if (!result) {
        res.status(409).json({
          error:
            "Không có nhân viên phù hợp. Vui lòng kiểm tra lại chuyên môn và khu vực.",
        });
        return;
      }
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
);

/**
 * POST /api/dispatch/manual/:visitId
 * Admin manually assigns a specific staff member
 */
router.post(
  "/manual/:visitId",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { visitId } = req.params;
    const { staffId } = req.body as { staffId: string };
    if (!staffId) {
      res.status(400).json({ error: "Thiếu staffId" });
      return;
    }
    try {
      const result = await manualAssignStaff(visitId, staffId);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
);

export default router;
