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
            Review and view account opening documents for branch{" "}
            {user.branchCode ?? "—"}.
          </p>
        </div>

        <DocumentReviewList
          branchCode={user.branchCode ?? undefined}
          enabled={isReady && Boolean(user.branchCode)}
        />

        {!user.branchCode ? (
          <div
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            Your account is not linked to a branch. Contact an administrator to assign
            a branch before you can review documents.
          </div>
        ) : null}
      </div>
    </UserLayout>
  );
}
