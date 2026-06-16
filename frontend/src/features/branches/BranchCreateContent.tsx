"use client";

import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { createBranch } from "@/features/branches/api";
import { BranchForm } from "@/features/branches/BranchForm";
import type { BranchFormValues } from "@/features/branches/types";

const DEFAULT_VALUES: BranchFormValues = {
  branchCode: "",
  branchName: "",
  address: "",
  phoneNumber: "",
  email: "",
  status: "active",
};

export function BranchCreateContent() {
  const router = useRouter();
  const { user, isReady, handleLogout } = useAdminAuth();

  async function handleSubmit(values: BranchFormValues) {
    await createBranch(values);
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
          <h1 className="text-2xl font-bold text-brand-blue">Create Branch</h1>
          <p className="mt-1 text-sm text-brand-black-75">
            Add a new branch to the bank network
          </p>
        </div>

        <Card>
          <CardHeader
            title="Branch Details"
            description="Enter the branch information below"
          />
          <CardContent>
            <BranchForm
              defaultValues={DEFAULT_VALUES}
              submitLabel="Create Branch"
              onSubmit={handleSubmit}
              onCancel={() => router.push("/admin/branches")}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
