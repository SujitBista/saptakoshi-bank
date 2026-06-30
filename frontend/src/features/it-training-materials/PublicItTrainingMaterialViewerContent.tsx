"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicPortalLayout } from "@/components/layout/PublicPortalLayout";
import { Button } from "@/components/ui/Button";
import { fetchItTrainingMaterialById } from "@/features/it-training-materials/api";
import { ItTrainingMaterialViewer } from "@/features/it-training-materials/ItTrainingMaterialViewer";
import type { ItTrainingMaterial } from "@/features/it-training-materials/types";
import { getApiErrorMessage } from "@/lib/api-client";

export function PublicItTrainingMaterialViewerContent({ id }: { id: number }) {
  const [material, setMaterial] = useState<ItTrainingMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMaterial() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchItTrainingMaterialById(id);
        setMaterial(response);
      } catch (err) {
        setError(
          getApiErrorMessage(err, "Unable to load IT training material. Please try again.")
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadMaterial();
  }, [id]);

  return (
    <PublicPortalLayout>
      <div className="mx-auto max-w-6xl">
        {material ? (
          <div className="mb-4 flex justify-end">
            <Link href="/training-materials/it">
              <Button variant="outline">Back to List</Button>
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
          <ItTrainingMaterialViewer documentId={material.id} title={material.title} />
        ) : null}
      </div>
    </PublicPortalLayout>
  );
}
