"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicPortalLayout } from "@/components/layout/PublicPortalLayout";
import { Button } from "@/components/ui/Button";
import { fetchCreditTrainingMaterialById } from "@/features/credit-training-materials/api";
import { CreditTrainingMaterialViewer } from "@/features/credit-training-materials/CreditTrainingMaterialViewer";
import type { CreditTrainingMaterial } from "@/features/credit-training-materials/types";
import { getApiErrorMessage } from "@/lib/api-client";

export function PublicCreditTrainingMaterialViewerContent({ id }: { id: number }) {
  const [material, setMaterial] = useState<CreditTrainingMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [id]);

  return (
    <PublicPortalLayout>
      <div className="mx-auto max-w-6xl">
        {material ? (
          <div className="mb-4 flex justify-end">
            <Link href="/training-materials/credit">
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
          <CreditTrainingMaterialViewer documentId={material.id} title={material.title} />
        ) : null}
      </div>
    </PublicPortalLayout>
  );
}
