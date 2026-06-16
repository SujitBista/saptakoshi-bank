"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { fetchBranches } from "@/features/branches/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { createUser } from "@/features/users/api";
import { UserCreateForm } from "@/features/users/UserCreateForm";
import type { BranchOption, UserFormValues } from "@/features/users/types";

const DEFAULT_VALUES: UserFormValues = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  branchId: "",
  role: "USER",
  status: "active",
};

export function UserCreateContent() {
  const router = useRouter();
  const { user, isReady, handleLogout } = useAdminAuth();
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);

  useEffect(() => {
    if (!isReady) return;

    async function loadBranches() {
      const data = await fetchBranches({ limit: 100 });
      setBranchOptions(
        data.branches.map((branch) => ({
          value: String(branch.id),
          label: `${branch.branchCode} — ${branch.branchName}`,
        }))
      );
    }

    void loadBranches();
  }, [isReady]);

  async function handleSubmit(values: UserFormValues) {
    await createUser(values);
    router.push("/admin/users");
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
          <h1 className="text-2xl font-bold text-brand-blue">Create User</h1>
          <p className="mt-1 text-sm text-brand-black-75">
            Add a new staff account to the portal
          </p>
        </div>

        <Card>
          <CardHeader
            title="User Details"
            description="Enter the user information below"
          />
          <CardContent>
            <UserCreateForm
              defaultValues={DEFAULT_VALUES}
              branchOptions={branchOptions}
              submitLabel="Create User"
              onSubmit={handleSubmit}
              onCancel={() => router.push("/admin/users")}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
