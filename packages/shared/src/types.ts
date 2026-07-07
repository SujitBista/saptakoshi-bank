import type { UserRole } from "./constants";

export type HealthStatus = "ok" | "degraded" | "down";

export interface HealthResponse {
  status: HealthStatus;
  service: string;
  timestamp: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  username?: string;
  email: string;
  role: UserRole;
  branchId: number | null;
  branchCode: string | null;
  branchName: string | null;
  mustResetPassword: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
