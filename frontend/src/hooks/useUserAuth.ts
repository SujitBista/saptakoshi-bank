"use client";

import { USER_ROLES } from "@saptakoshi/shared";
import { useAuth } from "@/hooks/useAuth";

const STAFF_ROLES = [USER_ROLES.EMPLOYEE, USER_ROLES.BRANCH_MANAGER] as const;

export function useStaffAuth() {
  return useAuth({
    allowedRoles: [...STAFF_ROLES],
    loginPath: "/login",
    forbiddenPath: "/admin/dashboard",
  });
}

export function useEmployeeAuth() {
  return useAuth({
    requiredRole: USER_ROLES.EMPLOYEE,
    loginPath: "/login",
    forbiddenPath: "/dashboard",
  });
}

export function useBranchManagerAuth() {
  return useAuth({
    requiredRole: USER_ROLES.BRANCH_MANAGER,
    loginPath: "/login",
    forbiddenPath: "/dashboard",
  });
}

export function useDocumentReviewerAuth(variant: "branch-manager" | "admin") {
  return useAuth(
    variant === "admin"
      ? {
          requiredRole: USER_ROLES.ADMIN,
          loginPath: "/admin/login",
          forbiddenPath: "/dashboard",
        }
      : {
          requiredRole: USER_ROLES.BRANCH_MANAGER,
          loginPath: "/login",
          forbiddenPath: "/dashboard",
        }
  );
}
