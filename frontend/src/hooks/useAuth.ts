"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser, UserRole } from "@saptakoshi/shared";
import { getUser, isAuthenticated, removeToken } from "@/lib/auth";

type UseAuthOptions = {
  requiredRole?: UserRole;
  loginPath?: string;
  forbiddenPath?: string;
};

export function useAuth(options: UseAuthOptions = {}) {
  const {
    requiredRole,
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

    if (requiredRole && storedUser.role !== requiredRole) {
      router.replace(
        storedUser.role === "ADMIN" ? "/admin/dashboard" : forbiddenPath
      );
      return;
    }

    setUser(storedUser);
    setIsReady(true);
  }, [forbiddenPath, loginPath, requiredRole, router]);

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
