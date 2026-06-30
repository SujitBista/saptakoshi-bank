"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  fetchCreditTrainingMaterialById,
  creditTrainingMaterialToFormValues,
  updateCreditTrainingMaterial,
} from "@/features/credit-training-materials/api";
import { CreditTrainingMaterialForm } from "@/features/credit-training-materials/CreditTrainingMaterialForm";
import type { CreditTrainingMaterial } from "@/features/credit-training-materials/types";
import { getApiErrorMessage } from "@/lib/api-client";

export function AdminCreditTrainingMaterialEditContent({ id }: { id: number }) {
  const { user, isReady, handleLogout } = useAdminAuth();
  const router = useRouter();
  const [material, setMaterial] = useState<CreditTrainingMaterial | null>(null);
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
        const response = await fetchCreditTrainingMaterialById(id);
        setMaterial(response);
      } catch (err) {
        setError(
          getApiErrorMessage(err, "Unable to load Credit training material. Please try again.")
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
            title="Edit Credit Training Material"
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
              <CreditTrainingMaterialForm
                mode="edit"
                defaultValues={creditTrainingMaterialToFormValues(material)}
                currentFileName={material.fileName}
                submitLabel="Save Changes"
                onSubmit={async (values) => {
                  await updateCreditTrainingMaterial(id, values);
                  router.push(`/admin/training-materials/credit/${id}`);
                }}
                onCancel={() => router.push("/admin/training-materials/credit")}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
