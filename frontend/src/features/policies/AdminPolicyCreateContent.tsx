"use client";

import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { createPolicy } from "@/features/policies/api";
import { PolicyForm } from "@/features/policies/PolicyForm";
import type { CreatePolicySchemaValues } from "@/features/policies/policy-schema";

const defaultValues: CreatePolicySchemaValues = {
  title: "",
  document: undefined as unknown as FileList,
};

export function AdminPolicyCreateContent() {
  const { user, isReady, handleLogout } = useAdminAuth();
  const router = useRouter();

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
            title="Upload Policy"
            description="Create a new public policy entry and upload its PDF document"
          />
          <CardContent>
            <PolicyForm
              defaultValues={defaultValues}
              submitLabel="Upload Policy"
              onSubmit={async (values) => {
                const policy = await createPolicy(values);
                router.push(`/admin/policies/${policy.id}`);
              }}
              onCancel={() => router.push("/admin/policies")}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
