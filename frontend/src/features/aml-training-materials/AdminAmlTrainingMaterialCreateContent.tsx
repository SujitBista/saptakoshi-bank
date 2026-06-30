"use client";

import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { createAmlTrainingMaterial } from "@/features/aml-training-materials/api";
import { AmlTrainingMaterialForm } from "@/features/aml-training-materials/AmlTrainingMaterialForm";
import type { CreateAmlTrainingMaterialSchemaValues } from "@/features/aml-training-materials/aml-training-material-schema";

const defaultValues: CreateAmlTrainingMaterialSchemaValues = {
  title: "",
  document: undefined as unknown as FileList,
};

export function AdminAmlTrainingMaterialCreateContent() {
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
            title="Upload AML Training Material"
            description="Create a new public AML training material entry and upload its PDF document"
          />
          <CardContent>
            <AmlTrainingMaterialForm
              mode="create"
              defaultValues={defaultValues}
              submitLabel="Upload AML Training Material"
              onSubmit={async (values) => {
                const material = await createAmlTrainingMaterial(values);
                router.push(`/admin/training-materials/aml/${material.id}`);
              }}
              onCancel={() => router.push("/admin/training-materials/aml")}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
