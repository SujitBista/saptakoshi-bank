"use client";

import { UserLayout } from "@/components/layout/UserLayout";
import { DocumentReviewList } from "@/features/account-opening/DocumentReviewList";
import { useBranchManagerAuth } from "@/hooks/useUserAuth";

export function DocumentReviewContent() {
  const { user, isReady, handleLogout } = useBranchManagerAuth();

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
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-blue">Document Review</h1>
          <p className="mt-1 text-sm text-brand-black-75">
            Review and approve pending account opening documents from your branch.
          </p>
        </div>

        <DocumentReviewList
          branchCode={user.branchCode ?? undefined}
          enabled={isReady}
        />
      </div>
    </UserLayout>
  );
}
