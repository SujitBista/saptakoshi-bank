"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  fetchRiskTrainingMaterialById,
  riskTrainingMaterialToFormValues,
  updateRiskTrainingMaterial,
} from "@/features/risk-training-materials/api";
import { RiskTrainingMaterialForm } from "@/features/risk-training-materials/RiskTrainingMaterialForm";
import type { RiskTrainingMaterial } from "@/features/risk-training-materials/types";
import { getApiErrorMessage } from "@/lib/api-client";

export function AdminRiskTrainingMaterialEditContent({ id }: { id: number }) {
  const { user, isReady, handleLogout } = useAdminAuth();
  const router = useRouter();
  const [material, setMaterial] = useState<RiskTrainingMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    async function loadMaterial() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchRiskTrainingMaterialById(id);
        setMaterial(response);
      } catch (err) {
        setError(
          getApiErrorMessage(err, "Unable to load Risks training material. Please try again.")
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadMaterial();
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
            title="Edit Risks Training Material"
            description="Update the title and optionally replace the PDF document"
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
            ) : material ? (
              <RiskTrainingMaterialForm
                mode="edit"
                defaultValues={riskTrainingMaterialToFormValues(material)}
                currentFileName={material.fileName}
                submitLabel="Save Changes"
                onSubmit={async (values) => {
                  await updateRiskTrainingMaterial(id, values);
                  router.push(`/admin/training-materials/risks/${id}`);
                }}
                onCancel={() => router.push("/admin/training-materials/risks")}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
