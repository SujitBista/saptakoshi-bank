"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  fetchAmlTrainingMaterialById,
  amlTrainingMaterialToFormValues,
  updateAmlTrainingMaterial,
} from "@/features/aml-training-materials/api";
import { AmlTrainingMaterialForm } from "@/features/aml-training-materials/AmlTrainingMaterialForm";
import type { AmlTrainingMaterial } from "@/features/aml-training-materials/types";
import { getApiErrorMessage } from "@/lib/api-client";

export function AdminAmlTrainingMaterialEditContent({ id }: { id: number }) {
  const { user, isReady, handleLogout } = useAdminAuth();
  const router = useRouter();
  const [material, setMaterial] = useState<AmlTrainingMaterial | null>(null);
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
        const response = await fetchAmlTrainingMaterialById(id);
        setMaterial(response);
      } catch (err) {
        setError(
          getApiErrorMessage(err, "Unable to load AML training material. Please try again.")
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
            title="Edit AML Training Material"
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
              <AmlTrainingMaterialForm
                mode="edit"
                defaultValues={amlTrainingMaterialToFormValues(material)}
                currentFileName={material.fileName}
                submitLabel="Save Changes"
                onSubmit={async (values) => {
                  await updateAmlTrainingMaterial(id, values);
                  router.push(`/admin/training-materials/aml/${id}`);
                }}
                onCancel={() => router.push("/admin/training-materials/aml")}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
