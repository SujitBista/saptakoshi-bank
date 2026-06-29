"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { fetchProductPaperById } from "@/features/product-papers/api";
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
      <div className="mx-auto max-w-6xl">
        {productPaper ? (
          <div className="mb-4 flex justify-end gap-2">
            <Link href="/admin/product-papers">
              <Button variant="outline">Back to List</Button>
            </Link>
            <Link href={`/admin/product-papers/${productPaper.id}/edit`}>
              <Button>Edit Metadata</Button>
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
    </AdminLayout>
  );
}
