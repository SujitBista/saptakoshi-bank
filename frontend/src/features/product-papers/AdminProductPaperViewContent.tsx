"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  fetchProductPaperById,
  formatFileSize,
  formatProductPaperDate,
  getProductPaperCategoryLabel,
} from "@/features/product-papers/api";
import { ProductPaperViewer } from "@/features/product-papers/ProductPaperViewer";
import type { ProductPaper } from "@/features/product-papers/types";
import { getApiErrorMessage } from "@/lib/api-client";

export function AdminProductPaperViewContent({ id }: { id: number }) {
  const { user, isReady, handleLogout } = useAdminAuth();
  const [productPaper, setProductPaper] = useState<ProductPaper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }

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
  }, [id, isReady]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-blue-05">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
      </div>
    );
  }

  return (
    <AdminLayout
      userEmail={user.email}
      userRole={user.role}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-blue sm:text-2xl">
              Product Paper Details
            </h1>
            <p className="mt-1 text-sm text-brand-black-75">
              Review the public metadata and inline PDF viewer.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/admin/product-papers">
              <Button variant="outline">Back to List</Button>
            </Link>
            {productPaper ? (
              <Link href={`/admin/product-papers/${productPaper.id}/edit`}>
                <Button>Edit Metadata</Button>
              </Link>
            ) : null}
          </div>
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-black-50">
                      Uploaded By
                    </p>
                    <p className="mt-1 text-sm text-brand-black">
                      {productPaper.uploadedByName}
                    </p>
                  </div>
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
                      Original File
                    </p>
                    <p className="mt-1 text-sm text-brand-black">
                      {productPaper.originalFileName}
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
    </AdminLayout>
  );
}
