"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  fetchPolicyById,
  policyToFormValues,
  updatePolicy,
} from "@/features/policies/api";
import { PolicyForm } from "@/features/policies/PolicyForm";
import type { Policy } from "@/features/policies/types";
import { getApiErrorMessage } from "@/lib/api-client";

export function AdminPolicyEditContent({ id }: { id: number }) {
  const { user, isReady, handleLogout } = useAdminAuth();
  const router = useRouter();
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
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader
            title="Edit Policy"
            description="Update the policy title and optionally replace the PDF document"
          />
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
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
              <PolicyForm
                mode="edit"
                defaultValues={policyToFormValues(policy)}
                currentFileName={policy.fileName}
                submitLabel="Save Changes"
                onSubmit={async (values) => {
                  await updatePolicy(id, values);
                  router.push(`/admin/policies/${id}`);
                }}
                onCancel={() => router.push(`/admin/policies/${id}`)}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
