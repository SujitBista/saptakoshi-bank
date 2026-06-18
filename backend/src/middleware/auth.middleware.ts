import type { NextFunction, Request, Response } from "express";
import { USER_ROLES } from "@saptakoshi/shared";
import { verifyToken } from "../auth/jwt";

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
  branch_id: number | null;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const payload = verifyToken(header.slice(7));
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      branch_id: payload.branchId,
    };
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== USER_ROLES.ADMIN) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  next();
}
