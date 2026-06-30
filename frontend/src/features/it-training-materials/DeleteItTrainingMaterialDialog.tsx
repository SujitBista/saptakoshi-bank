"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { deleteItTrainingMaterial } from "@/features/it-training-materials/api";
import type { ItTrainingMaterial } from "@/features/it-training-materials/types";
import { ApiError } from "@/lib/api-client";

interface DeleteItTrainingMaterialDialogProps {
  material: ItTrainingMaterial | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (deletedId: number) => void;
}

export function DeleteItTrainingMaterialDialog({
  material,
  open,
  onClose,
  onSuccess,
}: DeleteItTrainingMaterialDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!material) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteItTrainingMaterial(material.id);
      onSuccess(material.id);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to delete IT training material. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      title="Delete IT Training Material"
      description={
        material
          ? `Delete "${material.title}"? This will remove the metadata record and PDF file.`
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
