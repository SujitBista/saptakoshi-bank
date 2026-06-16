import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
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

  return {
    sub: Number(payload.sub),
    email: String(payload.email),
    role: String(payload.role),
  };
}
