"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getUser, isAuthenticated, removeToken } from "@/lib/auth";
import type { AdminUser } from "@/features/admin-auth/types";

export function AdminDashboardContent() {
  const router = useRouter();
  const [user] = useState<AdminUser | null>(() => {
    if (typeof window === "undefined") return null;
    return isAuthenticated() ? getUser() : null;
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/admin/login");
    }
  }, [router]);

  function handleLogout() {
    removeToken();
    router.push("/admin/login");
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-blue-05">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
      </div>
    );
  }

  return (
    <AdminLayout
      userEmail={user.email}
      userRole={user.role}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-blue">Dashboard</h1>
          <p className="mt-1 text-sm text-brand-black-75">
            Staff administration portal for Saptakoshi Development Bank
          </p>
        </div>

        <Card>
          <CardHeader
            title="Welcome, Admin"
            description="You are signed in to the staff administration portal."
          />
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-brand-blue-15 bg-brand-blue-05 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
                  Email
                </p>
                <p className="mt-2 text-sm font-medium text-brand-black">
                  {user.email}
                </p>
              </div>
              <div className="rounded-xl border border-brand-green-15 bg-brand-green-05 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-green">
                  Role
                </p>
                <p className="mt-2 text-sm font-medium capitalize text-brand-black">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-brand-green-15 bg-brand-green-05 px-5 py-4">
              <span
                className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-green"
                aria-hidden="true"
              />
              <p className="text-sm text-brand-black-75">
                Session active. Use Logout when you are finished with your
                administrative tasks.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
