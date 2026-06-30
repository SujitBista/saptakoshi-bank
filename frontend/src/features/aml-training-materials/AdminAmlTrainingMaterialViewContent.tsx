"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { fetchAmlTrainingMaterialById } from "@/features/aml-training-materials/api";
import { AmlTrainingMaterialViewer } from "@/features/aml-training-materials/AmlTrainingMaterialViewer";
import type { AmlTrainingMaterial } from "@/features/aml-training-materials/types";
import { getApiErrorMessage } from "@/lib/api-client";

export function AdminAmlTrainingMaterialViewContent({ id }: { id: number }) {
  const { user, isReady, handleLogout } = useAdminAuth();
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
      <div className="mx-auto max-w-6xl">
        {material ? (
          <div className="mb-4 flex justify-end gap-2">
            <Link href="/admin/training-materials/aml">
              <Button variant="outline">Back to List</Button>
            </Link>
            <Link href={`/admin/training-materials/aml/${material.id}/edit`}>
              <Button>Edit AML Training Material</Button>
            </Link>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[70vh] items-center justify-center">
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
          <AmlTrainingMaterialViewer documentId={material.id} title={material.title} />
        ) : null}
      </div>
    </AdminLayout>
  );
}
