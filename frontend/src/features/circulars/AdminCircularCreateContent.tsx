"use client";

import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { createCircular } from "@/features/circulars/api";
import { CircularForm } from "@/features/circulars/CircularForm";
import type { CreateCircularSchemaValues } from "@/features/circulars/circular-schema";

const defaultValues: CreateCircularSchemaValues = {
  title: "",
  document: undefined as unknown as FileList,
};

export function AdminCircularCreateContent() {
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
            title="Upload Circular"
            description="Create a new public circular entry and upload its PDF document"
          />
          <CardContent>
            <CircularForm
              mode="create"
              defaultValues={defaultValues}
              submitLabel="Upload Circular"
              onSubmit={async (values) => {
                const circular = await createCircular(values);
                router.push(`/admin/circulars/${circular.id}`);
              }}
              onCancel={() => router.push("/admin/circulars")}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
