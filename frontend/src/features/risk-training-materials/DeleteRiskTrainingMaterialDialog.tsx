"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { deleteRiskTrainingMaterial } from "@/features/risk-training-materials/api";
import type { RiskTrainingMaterial } from "@/features/risk-training-materials/types";
import { ApiError } from "@/lib/api-client";

interface DeleteRiskTrainingMaterialDialogProps {
  material: RiskTrainingMaterial | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (deletedId: number) => void;
}

export function DeleteRiskTrainingMaterialDialog({
  material,
  open,
  onClose,
  onSuccess,
}: DeleteRiskTrainingMaterialDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!material) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteRiskTrainingMaterial(material.id);
      onSuccess(material.id);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to delete Risks training material. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      title="Delete Risks Training Material"
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
