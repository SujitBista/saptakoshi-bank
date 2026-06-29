"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicPortalLayout } from "@/components/layout/PublicPortalLayout";
import { Button } from "@/components/ui/Button";
import { fetchProductPaperById } from "@/features/product-papers/api";
import { ProductPaperViewer } from "@/features/product-papers/ProductPaperViewer";
import type { ProductPaper } from "@/features/product-papers/types";
import { getApiErrorMessage } from "@/lib/api-client";

export function PublicProductPaperViewerContent({ id }: { id: number }) {
  const [productPaper, setProductPaper] = useState<ProductPaper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProductPaper() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchProductPaperById(id);
        setProductPaper(response);
      } catch (err) {
        setError(
          getApiErrorMessage(err, "Unable to load product paper. Please try again.")
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProductPaper();
  }, [id]);

  return (
    <PublicPortalLayout>
      <div className="mx-auto max-w-6xl">
        {productPaper ? (
          <div className="mb-4 flex justify-end">
            <Link href={`/product-paper/${productPaper.category.toLowerCase()}`}>
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
        ) : productPaper ? (
          <ProductPaperViewer documentId={productPaper.id} title={productPaper.title} />
        ) : null}
      </div>
    </PublicPortalLayout>
  );
}
