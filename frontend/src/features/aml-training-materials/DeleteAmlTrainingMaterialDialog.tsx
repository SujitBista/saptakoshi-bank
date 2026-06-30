"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { deleteAmlTrainingMaterial } from "@/features/aml-training-materials/api";
import type { AmlTrainingMaterial } from "@/features/aml-training-materials/types";
import { ApiError } from "@/lib/api-client";

interface DeleteAmlTrainingMaterialDialogProps {
  material: AmlTrainingMaterial | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (deletedId: number) => void;
}

export function DeleteAmlTrainingMaterialDialog({
  material,
  open,
  onClose,
  onSuccess,
}: DeleteAmlTrainingMaterialDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!material) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteAmlTrainingMaterial(material.id);
      onSuccess(material.id);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to delete AML training material. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      title="Delete AML Training Material"
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
