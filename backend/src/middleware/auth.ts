import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
 * Require admin role. Must be used after requireAuth.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.authUser || req.authUser.role !== "admin") {
    return res.status(403).json({ error: "Không có quyền truy cập" });
  }
  next();
}
