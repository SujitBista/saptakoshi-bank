"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicPortalLayout } from "@/components/layout/PublicPortalLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  fetchProductPaperById,
  formatFileSize,
  formatProductPaperDate,
  getProductPaperCategoryLabel,
} from "@/features/product-papers/api";
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
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-blue">Product Paper Viewer</h1>
            <p className="mt-2 text-sm text-brand-black-75">
              Product papers open inline inside the application without public download
              controls.
            </p>
          </div>

          <Link href={productPaper ? `/product-paper/${productPaper.category.toLowerCase()}` : "/"}>
            <Button variant="outline">Back to List</Button>
          </Link>
        </div>

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
        ) : productPaper ? (
          <>
            <Card>
              <CardHeader
                title={productPaper.title}
                description={`${getProductPaperCategoryLabel(productPaper.category)} product paper`}
              />
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-black-50">
                      File Size
                    </p>
                    <p className="mt-1 text-sm text-brand-black">
                      {formatFileSize(productPaper.fileSize)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-black-50">
                      Updated
                    </p>
                    <p className="mt-1 text-sm text-brand-black">
                      {formatProductPaperDate(productPaper.updatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-black-50">
                      Original File
                    </p>
                    <p className="mt-1 text-sm text-brand-black">
                      {productPaper.originalFileName}
                    </p>
                  </div>
                </div>

                {productPaper.description ? (
                  <div className="mt-4 border-t border-brand-black-15 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-black-50">
                      Description
                    </p>
                    <p className="mt-1 text-sm text-brand-black">{productPaper.description}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <ProductPaperViewer documentId={productPaper.id} title={productPaper.title} />
          </>
        ) : null}
      </div>
    </PublicPortalLayout>
  );
}
