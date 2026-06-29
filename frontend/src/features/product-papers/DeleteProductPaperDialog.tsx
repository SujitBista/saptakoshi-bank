"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { deleteProductPaper } from "@/features/product-papers/api";
import type { ProductPaper } from "@/features/product-papers/types";
import { ApiError } from "@/lib/api-client";

interface DeleteProductPaperDialogProps {
  productPaper: ProductPaper | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (deletedId: number) => void;
}

export function DeleteProductPaperDialog({
  productPaper,
  open,
  onClose,
  onSuccess,
}: DeleteProductPaperDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!productPaper) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteProductPaper(productPaper.id);
      onSuccess(productPaper.id);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to delete product paper. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      title="Delete Product Paper"
      description={
        productPaper
          ? `Delete "${productPaper.title}"? This will remove the metadata record and PDF file.`
          : undefined
      }
      confirmLabel="Delete"
      isLoading={isLoading}
      variant="danger"
      onConfirm={handleConfirm}
      onClose={() => {
        setError(null);
        onClose();
      }}
    >
      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}
    </Dialog>
  );
}
