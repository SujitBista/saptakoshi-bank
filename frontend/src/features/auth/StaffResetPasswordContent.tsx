"use client";

import { UserLayout } from "@/components/layout/UserLayout";
import { ResetPasswordForm } from "@/features/auth/ResetPasswordForm";
import { useStaffAuth } from "@/hooks/useUserAuth";

export function StaffResetPasswordContent() {
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
      <ResetPasswordForm user={user} />
    </UserLayout>
  );
}
