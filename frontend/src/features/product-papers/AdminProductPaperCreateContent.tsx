"use client";

import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { createProductPaper } from "@/features/product-papers/api";
import { ProductPaperForm } from "@/features/product-papers/ProductPaperForm";
import type { ProductPaperFormValues } from "@/features/product-papers/types";

const defaultValues: ProductPaperFormValues = {
  category: "DEPOSIT",
  title: "",
  description: "",
};

export function AdminProductPaperCreateContent() {
  const { user, isReady, handleLogout } = useAdminAuth();
  const router = useRouter();

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
            title="Upload Product Paper"
            description="Create a new public product paper entry and upload its PDF document"
          />
          <CardContent>
            <ProductPaperForm
              defaultValues={defaultValues}
              mode="create"
              submitLabel="Upload Product Paper"
              onSubmit={async (values) => {
                const productPaper = await createProductPaper(values);
                router.push(`/admin/product-papers/${productPaper.id}`);
              }}
              onCancel={() => router.push("/admin/product-papers")}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
