"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "@saptakoshi/shared";
import { USER_ROLES } from "@saptakoshi/shared";
import {
  getResetPasswordPathForRole,
  getUser,
  isAuthenticated,
  removeToken,
} from "@/lib/auth";

type UseAuthOptions = {
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  loginPath?: string;
  forbiddenPath?: string;
};

function isRoleAllowed(
  userRole: UserRole,
  requiredRole?: UserRole,
  allowedRoles?: UserRole[]
): boolean {
  if (allowedRoles && allowedRoles.length > 0) {
    return allowedRoles.includes(userRole);
  }

  if (requiredRole) {
    return userRole === requiredRole;
  }

  return true;
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    requiredRole,
    allowedRoles,
    loginPath = "/login",
    forbiddenPath = "/dashboard",
  } = options;
  const router = useRouter();
  const pathname = usePathname();
  const storedUser = getUser();
  const allowedRolesKey = allowedRoles?.join("|") ?? "";
  const resetPasswordPath = storedUser
    ? getResetPasswordPathForRole(storedUser.role)
    : null;
  const isReady =
    Boolean(storedUser) &&
    isRoleAllowed(storedUser.role, requiredRole, allowedRoles) &&
    (!storedUser.mustResetPassword || pathname === resetPasswordPath);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(loginPath);
      return;
    }

    if (!storedUser) {
      removeToken();
      router.replace(loginPath);
      return;
    }

    if (!isRoleAllowed(storedUser.role, requiredRole, allowedRoles)) {
      router.replace(
        storedUser.role === USER_ROLES.ADMIN ? "/admin/dashboard" : forbiddenPath
      );
      return;
    }

    const resetPasswordPath = getResetPasswordPathForRole(storedUser.role);
    if (
      storedUser.mustResetPassword &&
      resetPasswordPath &&
      pathname !== resetPasswordPath
    ) {
      router.replace(resetPasswordPath);
      return;
    }
    // router methods are stable; allowedRoles is keyed to avoid array identity loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedRolesKey, forbiddenPath, loginPath, pathname, requiredRole]);

  function handleLogout() {
    removeToken();
    router.push(loginPath);
  }

  return {
    user: isReady ? storedUser : null,
    isReady,
    handleLogout,
  };
}
