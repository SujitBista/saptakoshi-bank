"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { fetchBranches } from "@/features/branches/api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ApiError } from "@/lib/api-client";
import {
  fetchUserById,
  updateUser,
  userToEditFormValues,
} from "@/features/users/api";
import { UserEditForm } from "@/features/users/UserEditForm";
import type { BranchOption, UserEditFormValues } from "@/features/users/types";

interface UserEditContentProps {
  userId: number;
}

export function UserEditContent({ userId }: UserEditContentProps) {
  const router = useRouter();
  const { user, isReady, handleLogout } = useAdminAuth();
  const [defaultValues, setDefaultValues] = useState<UserEditFormValues | null>(
    null
  );
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    async function loadData() {
      try {
        const [userData, branchData] = await Promise.all([
          fetchUserById(userId),
          fetchBranches({ limit: 100 }),
        ]);

        setDefaultValues(userToEditFormValues(userData));
        setBranchOptions(
          branchData.branches.map((branch) => ({
            value: String(branch.id),
            label: `${branch.branchCode} — ${branch.branchName}`,
          }))
        );
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Unable to load user. Please try again.");
        }
      }
    }

    void loadData();
  }, [userId, isReady]);

  async function handleSubmit(values: UserEditFormValues) {
    await updateUser(userId, values);
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
          <h1 className="text-2xl font-bold text-brand-blue">Edit User</h1>
          <p className="mt-1 text-sm text-brand-black-75">
            Update user account information
          </p>
        </div>

        <Card>
          <CardHeader
            title="User Details"
            description="Update the user information below"
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
              <UserEditForm
                defaultValues={defaultValues}
                branchOptions={branchOptions}
                submitLabel="Save Changes"
                onSubmit={handleSubmit}
                onCancel={() => router.push("/admin/users")}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
