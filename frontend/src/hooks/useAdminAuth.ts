"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, removeToken } from "@/lib/auth";
import type { AdminUser } from "@/features/admin-auth/types";

export function useAdminAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/admin/login");
      return;
    }

    setUser(getUser());
    setIsReady(true);
  }, [router]);

  function handleLogout() {
    removeToken();
    router.push("/admin/login");
  }

  return {
    user,
    isReady,
    handleLogout,
  };
}
