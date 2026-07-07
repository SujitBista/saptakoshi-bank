"use client";

import type { UserRole } from "@saptakoshi/shared";
import { USER_ROLES } from "@saptakoshi/shared";
import { useAuth } from "@/hooks/useAuth";

const STAFF_ROLES: UserRole[] = [
  USER_ROLES.MAKER,
  USER_ROLES.CHECKER,
  USER_ROLES.TELLER,
];

export function useStaffAuth() {
  return useAuth({
    allowedRoles: STAFF_ROLES,
    loginPath: "/login",
    forbiddenPath: "/admin/dashboard",
  });
}

export function useMakerAuth() {
  return useAuth({
    requiredRole: USER_ROLES.MAKER,
    loginPath: "/login",
    forbiddenPath: "/dashboard",
  });
}

export function useCheckerAuth() {
  return useAuth({
    requiredRole: USER_ROLES.CHECKER,
    loginPath: "/login",
    forbiddenPath: "/dashboard",
  });
}

export function useTellerAuth() {
  return useAuth({
    requiredRole: USER_ROLES.TELLER,
    loginPath: "/login",
    forbiddenPath: "/dashboard",
  });
}

export function useDocumentReviewerAuth(variant: "checker" | "admin") {
  return useAuth(
    variant === "admin"
      ? {
          requiredRole: USER_ROLES.ADMIN,
          loginPath: "/admin/login",
          forbiddenPath: "/dashboard",
        }
      : {
          requiredRole: USER_ROLES.CHECKER,
          loginPath: "/login",
          forbiddenPath: "/dashboard",
        }
  );
}
