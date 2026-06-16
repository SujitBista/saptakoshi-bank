"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ApiError } from "@/lib/api-client";
import { fetchBranchById, formatBranchDate } from "@/features/branches/api";
import type { Branch } from "@/features/branches/types";

interface BranchViewContentProps {
  branchId: number;
}

export function BranchViewContent({ branchId }: BranchViewContentProps) {
  const { user, isReady, handleLogout } = useAdminAuth();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    async function loadBranch() {
      try {
        const data = await fetchBranchById(branchId);
        setBranch(data);
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
            <h1 className="text-2xl font-bold text-brand-blue">Branch Details</h1>
            <p className="mt-1 text-sm text-brand-black-75">
              View branch information
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/branches">
              <Button variant="outline">Back to List</Button>
            </Link>
            {branch ? (
              <Link href={`/admin/branches/${branch.id}/edit`}>
                <Button>Edit Branch</Button>
              </Link>
            ) : null}
          </div>
        </div>

        <Card>
          <CardHeader
            title={branch?.branchName ?? "Branch"}
            description={branch?.branchCode}
          />
          <CardContent>
            {error ? (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : !branch ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="Branch Code" value={branch.branchCode} />
                <DetailItem label="Branch Name" value={branch.branchName} />
                <DetailItem label="Address" value={branch.address || "—"} />
                <DetailItem
                  label="Phone Number"
                  value={branch.phoneNumber || "—"}
                />
                <DetailItem label="Email" value={branch.email || "—"} />
                <div className="rounded-xl border border-brand-blue-15 bg-brand-blue-05 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
                    Status
                  </p>
                  <div className="mt-2">
                    <Badge variant={branch.isActive ? "success" : "neutral"}>
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <DetailItem
                  label="Created Date"
                  value={formatBranchDate(branch.createdAt)}
                />
                <DetailItem
                  label="Last Updated"
                  value={formatBranchDate(branch.updatedAt)}
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
