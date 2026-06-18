import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  branchId: number | null;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  const payload = jwt.verify(token, getJwtSecret());

  if (typeof payload === "string") {
    throw new Error("Invalid token payload");
  }

  const branchId =
    payload.branchId === null || payload.branchId === undefined
      ? null
      : Number(payload.branchId);

  return {
    sub: Number(payload.sub),
    email: String(payload.email),
    role: String(payload.role),
    branchId: Number.isNaN(branchId) ? null : branchId,
  };
}
