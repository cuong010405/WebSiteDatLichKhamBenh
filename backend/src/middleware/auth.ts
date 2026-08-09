import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthPayload {
  id: string;
  email: string;
  role: string;
}

// Extend Express Request to carry auth info
declare global {
  namespace Express {
    interface Request {
      authUser?: AuthPayload;
    }
  }
}

/**
 * Require a valid JWT in Authorization header.
 * Populates req.authUser on success.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Không có token xác thực" });
  }
  try {
    const payload = jwt.verify(header.split(" ")[1], JWT_SECRET) as AuthPayload;
    req.authUser = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

/**
 * Optional auth: populates req.authUser if token is provided and valid, otherwise continues without req.authUser.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.split(" ")[1], JWT_SECRET) as AuthPayload;
      req.authUser = payload;
    } catch {
      // Ignore token verification errors for optional auth
    }
  }
  next();
}

/**
 * Require admin role. Must be used after requireAuth.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.authUser || req.authUser.role !== "admin") {
    return res.status(403).json({ error: "Không có quyền truy cập" });
  }
  next();
}

/**
 * Require specific role(s). Must be used after requireAuth.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.authUser || !allowedRoles.includes(req.authUser.role)) {
      return res.status(403).json({ error: "Không có quyền thực hiện thao tác này" });
    }
    next();
  };
}

/**
 * Utility function to find Staff ID associated with the current AuthUser.
 * Looks up by email first, or returns null if not found.
 */
export async function getStaffIdForUser(authUser: AuthPayload): Promise<string | null> {
  if (!authUser || !authUser.email) return null;
  try {
    const userEmail = authUser.email.toLowerCase().trim();

    // 1. Exact email match (most reliable)
    const staffByEmail = await db.staff.findFirst({
      where: { Email: userEmail },
      select: { Id: true },
    });
    if (staffByEmail) return staffByEmail.Id;

    // 2. Fallback: look up by User's FullName → exact Staff.Name match
    const user = await db.user.findUnique({
      where: { Id: authUser.id },
      select: { FullName: true, Phone: true },
    });

    if (user?.FullName) {
      const staffByName = await db.staff.findFirst({
        where: { Name: user.FullName },
        select: { Id: true },
      });
      if (staffByName) {
        // Auto-heal: update the Staff email so next lookup is faster
        await db.staff.update({ where: { Id: staffByName.Id }, data: { Email: userEmail } }).catch(() => {});
        return staffByName.Id;
      }

      // 3. Partial name match (first word / last word)
      const nameParts = user.FullName.trim().split(/\s+/);
      const lastName = nameParts[nameParts.length - 1];
      const staffByPartialName = await db.staff.findFirst({
        where: { Name: { contains: lastName } },
        select: { Id: true, Name: true },
      });
      if (staffByPartialName) {
        await db.staff.update({ where: { Id: staffByPartialName.Id }, data: { Email: userEmail } }).catch(() => {});
        return staffByPartialName.Id;
      }
    }

    // 4. Phone number match as last resort
    if (user?.Phone) {
      const cleanPhone = user.Phone.replace(/\D/g, "");
      const allStaff = await db.staff.findMany({ select: { Id: true, Phone: true } });
      const matched = allStaff.find((s) => s.Phone?.replace(/\D/g, "") === cleanPhone);
      if (matched) {
        await db.staff.update({ where: { Id: matched.Id }, data: { Email: userEmail } }).catch(() => {});
        return matched.Id;
      }
    }

    return null;
  } catch (err) {
    console.error("Error looking up staff for user:", err);
    return null;
  }
}
