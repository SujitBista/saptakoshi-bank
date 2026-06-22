"use client";

import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useStaffAuth } from "@/hooks/useUserAuth";

export function UserDashboardContent() {
  const { user, isReady, handleLogout } = useStaffAuth();

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-blue-05">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
      </div>
    );
  }

  return (
    <UserLayout
      userEmail={user.email}
      userRole={user.role}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-brand-blue sm:text-2xl">Dashboard</h1>
          <p className="mt-1 text-sm text-brand-black-75">
            Welcome to the Saptakoshi Development Bank staff portal
          </p>
        </div>

        <Card>
          <CardHeader
            title={`Welcome, ${user.fullName}`}
            description="You are signed in to your branch staff account."
          />
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-brand-blue-15 bg-brand-blue-05 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
                  Full Name
                </p>
                <p className="mt-2 text-sm font-medium text-brand-black">
                  {user.fullName}
                </p>
              </div>
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
                  Branch Code
                </p>
                <p className="mt-2 text-sm font-medium text-brand-black">
                  {user.branchCode ?? "—"}
                </p>
              </div>
              <div className="rounded-xl border border-brand-green-15 bg-brand-green-05 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-green">
                  Branch Name
                </p>
                <p className="mt-2 text-sm font-medium text-brand-black">
                  {user.branchName ?? "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-brand-green-15 bg-brand-green-05 px-5 py-4">
              <span
                className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-green"
                aria-hidden="true"
              />
              <p className="text-sm text-brand-black-75">
                Session active. Use Logout when you are finished with your work.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
