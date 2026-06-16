import type { NextFunction, Request, Response } from "express";
import { USER_ROLES } from "@saptakoshi/shared";
import { verifyToken, type JwtPayload } from "../auth/jwt";

declare module "express-serve-static-core" {
  interface Request {
    authUser?: JwtPayload;
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
    req.authUser = verifyToken(header.slice(7));
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
  if (req.authUser?.role !== USER_ROLES.ADMIN) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  next();
}
