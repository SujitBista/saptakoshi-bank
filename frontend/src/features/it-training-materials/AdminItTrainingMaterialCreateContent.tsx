"use client";

import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { createItTrainingMaterial } from "@/features/it-training-materials/api";
import { ItTrainingMaterialForm } from "@/features/it-training-materials/ItTrainingMaterialForm";
import type { CreateItTrainingMaterialSchemaValues } from "@/features/it-training-materials/it-training-material-schema";

const defaultValues: CreateItTrainingMaterialSchemaValues = {
  title: "",
  document: undefined as unknown as FileList,
};

export function AdminItTrainingMaterialCreateContent() {
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
            title="Upload IT Training Material"
            description="Create a new public IT training material entry and upload its PDF document"
          />
          <CardContent>
            <ItTrainingMaterialForm
              mode="create"
              defaultValues={defaultValues}
              submitLabel="Upload IT Training Material"
              onSubmit={async (values) => {
                const material = await createItTrainingMaterial(values);
                router.push(`/admin/training-materials/it/${material.id}`);
              }}
              onCancel={() => router.push("/admin/training-materials/it")}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
