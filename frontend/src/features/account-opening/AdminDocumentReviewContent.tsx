"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DocumentReviewList } from "@/features/account-opening/DocumentReviewList";
import { fetchBranches } from "@/features/branches/api";
import type { Branch } from "@/features/branches/types";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminDocumentReviewContent() {
  const { user, isReady, handleLogout } = useAdminAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>();

  useEffect(() => {
    if (!isReady) return;

    async function loadBranches() {
      const { branches: branchList } = await fetchBranches({ limit: 100 });
      setBranches(branchList);
    }

    void loadBranches();
  }, [isReady]);

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
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-brand-blue sm:text-2xl">Document Review</h1>
          <p className="mt-1 text-sm text-brand-black-75">
            Review and view account opening documents across all branches.
          </p>
        </div>

        <DocumentReviewList
          branchId={selectedBranchId}
          branches={branches}
          selectedBranchId={selectedBranchId}
          onBranchChange={setSelectedBranchId}
          reviewBasePath="/admin/document-review"
          showBranchColumn
          enabled={isReady}
        />
      </div>
    </AdminLayout>
  );
}
