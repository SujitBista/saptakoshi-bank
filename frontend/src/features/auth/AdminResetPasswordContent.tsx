"use client";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { ResetPasswordForm } from "@/features/auth/ResetPasswordForm";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminResetPasswordContent() {
  const { user, isReady, handleLogout } = useAdminAuth();

  if (!isReady || !user) {
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
      <ResetPasswordForm user={user} />
    </AdminLayout>
  );
}
