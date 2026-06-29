"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  fetchProductPaperById,
  productPaperToFormValues,
  updateProductPaper,
} from "@/features/product-papers/api";
import { ProductPaperForm } from "@/features/product-papers/ProductPaperForm";
import type { ProductPaper } from "@/features/product-papers/types";
import { getApiErrorMessage } from "@/lib/api-client";

export function AdminProductPaperEditContent({ id }: { id: number }) {
  const { user, isReady, handleLogout } = useAdminAuth();
  const router = useRouter();
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
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader
            title="Edit Product Paper"
            description="Update public metadata without replacing the uploaded PDF file"
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
            ) : productPaper ? (
              <ProductPaperForm
                defaultValues={productPaperToFormValues(productPaper)}
                mode="edit"
                submitLabel="Save Changes"
                onSubmit={async (values) => {
                  await updateProductPaper(id, values);
                  router.push(`/admin/product-papers/${id}`);
                }}
                onCancel={() => router.push(`/admin/product-papers/${id}`)}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
