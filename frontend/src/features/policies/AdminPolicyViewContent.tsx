"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { fetchPolicyById } from "@/features/policies/api";
import { PolicyViewer } from "@/features/policies/PolicyViewer";
import type { Policy } from "@/features/policies/types";
import { getApiErrorMessage } from "@/lib/api-client";

export function AdminPolicyViewContent({ id }: { id: number }) {
  const { user, isReady, handleLogout } = useAdminAuth();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    async function loadPolicy() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchPolicyById(id);
        setPolicy(response);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load policy. Please try again."));
      } finally {
        setIsLoading(false);
      }
    }

    void loadPolicy();
  }, [id, isReady]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-blue-05">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
      </div>
    );
  }

  return (
    <AdminLayout userEmail={user.email} userRole={user.role} onLogout={handleLogout}>
      <div className="mx-auto max-w-6xl">
        {policy ? (
          <div className="mb-4 flex justify-end gap-2">
            <Link href="/admin/policies">
              <Button variant="outline">Back to List</Button>
            </Link>
            <Link href={`/admin/policies/${policy.id}/edit`}>
              <Button>Edit Policy</Button>
            </Link>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
          </div>
        ) : error ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        ) : policy ? (
          <PolicyViewer documentId={policy.id} title={policy.title} />
        ) : null}
      </div>
    </AdminLayout>
  );
}
