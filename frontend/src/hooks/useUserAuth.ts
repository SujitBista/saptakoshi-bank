"use client";

import { USER_ROLES } from "@saptakoshi/shared";
import { useAuth } from "@/hooks/useAuth";

export function useUserAuth() {
  return useAuth({
    requiredRole: USER_ROLES.USER,
    loginPath: "/login",
    forbiddenPath: "/admin/dashboard",
  });
}
