"use client";

import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { createCreditTrainingMaterial } from "@/features/credit-training-materials/api";
import { CreditTrainingMaterialForm } from "@/features/credit-training-materials/CreditTrainingMaterialForm";
import type { CreateCreditTrainingMaterialSchemaValues } from "@/features/credit-training-materials/credit-training-material-schema";

const defaultValues: CreateCreditTrainingMaterialSchemaValues = {
  title: "",
  document: undefined as unknown as FileList,
};

export function AdminCreditTrainingMaterialCreateContent() {
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
            title="Upload Credit Training Material"
            description="Create a new public Credit training material entry and upload its PDF document"
          />
          <CardContent>
            <CreditTrainingMaterialForm
              mode="create"
              defaultValues={defaultValues}
              submitLabel="Upload Credit Training Material"
              onSubmit={async (values) => {
                const material = await createCreditTrainingMaterial(values);
                router.push(`/admin/training-materials/credit/${material.id}`);
              }}
              onCancel={() => router.push("/admin/training-materials/credit")}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
