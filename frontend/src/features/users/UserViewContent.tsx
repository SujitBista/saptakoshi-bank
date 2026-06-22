"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ApiError } from "@/lib/api-client";
import { fetchUserById, formatUserDate } from "@/features/users/api";
import type { User } from "@/features/users/types";

interface UserViewContentProps {
  userId: number;
}

export function UserViewContent({ userId }: UserViewContentProps) {
  const { user, isReady, handleLogout } = useAdminAuth();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    async function loadUser() {
      try {
        const data = await fetchUserById(userId);
        setTargetUser(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Unable to load user. Please try again.");
        }
      }
    }

    void loadUser();
  }, [userId, isReady]);

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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-blue sm:text-2xl">User Details</h1>
            <p className="mt-1 text-sm text-brand-black-75">
              View staff account information
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/users">
              <Button variant="outline">Back to List</Button>
            </Link>
            {targetUser ? (
              <Link href={`/admin/users/${targetUser.id}/edit`}>
                <Button>Edit User</Button>
              </Link>
            ) : null}
          </div>
        </div>

        <Card>
          <CardHeader
            title={targetUser?.fullName ?? "User"}
            description={targetUser?.email}
          />
          <CardContent>
            {error ? (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : !targetUser ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="Full Name" value={targetUser.fullName} />
                <DetailItem label="Username" value={targetUser.username} />
                <DetailItem label="Email" value={targetUser.email} />
                <DetailItem label="Role" value={targetUser.role} />
                <DetailItem
                  label="Branch Code"
                  value={targetUser.branchCode || "—"}
                />
                <DetailItem
                  label="Branch Name"
                  value={targetUser.branchName || "—"}
                />
                <div className="rounded-xl border border-brand-blue-15 bg-brand-blue-05 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
                    Status
                  </p>
                  <div className="mt-2">
                    <Badge variant={targetUser.isActive ? "success" : "neutral"}>
                      {targetUser.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <DetailItem
                  label="Created Date"
                  value={formatUserDate(targetUser.createdAt)}
                />
                <DetailItem
                  label="Last Updated"
                  value={formatUserDate(targetUser.updatedAt)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-blue-15 bg-brand-blue-05 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-brand-black">{value}</p>
    </div>
  );
}
