"use client";

import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { createOperationTrainingMaterial } from "@/features/operation-training-materials/api";
import { OperationTrainingMaterialForm } from "@/features/operation-training-materials/OperationTrainingMaterialForm";
import type { CreateOperationTrainingMaterialSchemaValues } from "@/features/operation-training-materials/operation-training-material-schema";

const defaultValues: CreateOperationTrainingMaterialSchemaValues = {
  title: "",
  document: undefined as unknown as FileList,
};

export function AdminOperationTrainingMaterialCreateContent() {
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
            title="Upload Operation Training Material"
            description="Create a new public Operation training material entry and upload its PDF document"
          />
          <CardContent>
            <OperationTrainingMaterialForm
              mode="create"
              defaultValues={defaultValues}
              submitLabel="Upload Operation Training Material"
              onSubmit={async (values) => {
                const material = await createOperationTrainingMaterial(values);
                router.push(`/admin/training-materials/operation/${material.id}`);
              }}
              onCancel={() => router.push("/admin/training-materials/operation")}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
