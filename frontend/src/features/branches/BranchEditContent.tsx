"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ApiError } from "@/lib/api-client";
import {
  branchToFormValues,
  fetchBranchById,
  updateBranch,
} from "@/features/branches/api";
import { BranchForm } from "@/features/branches/BranchForm";
import type { BranchFormValues } from "@/features/branches/types";

interface BranchEditContentProps {
  branchId: number;
}

export function BranchEditContent({ branchId }: BranchEditContentProps) {
  const router = useRouter();
  const { user, isReady, handleLogout } = useAdminAuth();
  const [defaultValues, setDefaultValues] = useState<BranchFormValues | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    async function loadBranch() {
      try {
        const branch = await fetchBranchById(branchId);
        setDefaultValues(branchToFormValues(branch));
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Unable to load branch. Please try again.");
        }
      }
    }

    void loadBranch();
  }, [branchId, isReady]);

  async function handleSubmit(values: BranchFormValues) {
    await updateBranch(branchId, values);
    router.push("/admin/branches");
  }

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
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-blue">Edit Branch</h1>
          <p className="mt-1 text-sm text-brand-black-75">
            Update branch information
          </p>
        </div>

        <Card>
          <CardHeader
            title="Branch Details"
            description="Update the branch information below"
          />
          <CardContent>
            {error ? (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : !defaultValues ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
              </div>
            ) : (
              <BranchForm
                defaultValues={defaultValues}
                submitLabel="Save Changes"
                onSubmit={handleSubmit}
                onCancel={() => router.push("/admin/branches")}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
