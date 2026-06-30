"use client";

import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { createRiskTrainingMaterial } from "@/features/risk-training-materials/api";
import { RiskTrainingMaterialForm } from "@/features/risk-training-materials/RiskTrainingMaterialForm";
import type { CreateRiskTrainingMaterialSchemaValues } from "@/features/risk-training-materials/risk-training-material-schema";

const defaultValues: CreateRiskTrainingMaterialSchemaValues = {
  title: "",
  document: undefined as unknown as FileList,
};

export function AdminRiskTrainingMaterialCreateContent() {
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
            title="Upload Risks Training Material"
            description="Create a new public Risks training material entry and upload its PDF document"
          />
          <CardContent>
            <RiskTrainingMaterialForm
              mode="create"
              defaultValues={defaultValues}
              submitLabel="Upload Risks Training Material"
              onSubmit={async (values) => {
                const material = await createRiskTrainingMaterial(values);
                router.push(`/admin/training-materials/risks/${material.id}`);
              }}
              onCancel={() => router.push("/admin/training-materials/risks")}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
