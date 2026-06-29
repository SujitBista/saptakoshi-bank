"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { deleteCircular } from "@/features/circulars/api";
import type { Circular } from "@/features/circulars/types";
import { ApiError } from "@/lib/api-client";

interface DeleteCircularDialogProps {
  circular: Circular | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (deletedId: number) => void;
}

export function DeleteCircularDialog({
  circular,
  open,
  onClose,
  onSuccess,
}: DeleteCircularDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!circular) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteCircular(circular.id);
      onSuccess(circular.id);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to delete circular. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      title="Delete Circular"
      description={
        circular
          ? `Delete "${circular.title}"? This will remove the metadata record and PDF file.`
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
