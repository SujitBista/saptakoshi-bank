"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser, UserRole } from "@saptakoshi/shared";
import { USER_ROLES } from "@saptakoshi/shared";
import { getUser, isAuthenticated, removeToken } from "@/lib/auth";

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(loginPath);
      return;
    }

    const storedUser = getUser();

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

    setUser(storedUser);
    setIsReady(true);
  }, [allowedRoles, forbiddenPath, loginPath, requiredRole, router]);

  function handleLogout() {
    removeToken();
    router.push(loginPath);
  }

  return {
    user,
    isReady,
    handleLogout,
  };
}
