"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { deletePolicy } from "@/features/policies/api";
import type { Policy } from "@/features/policies/types";
import { ApiError } from "@/lib/api-client";

interface DeletePolicyDialogProps {
  policy: Policy | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (deletedId: number) => void;
}

export function DeletePolicyDialog({
  policy,
  open,
  onClose,
  onSuccess,
}: DeletePolicyDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!policy) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deletePolicy(policy.id);
      onSuccess(policy.id);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to delete policy. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      title="Delete Policy"
      description={
        policy
          ? `Delete "${policy.title}"? This will remove the metadata record and PDF file.`
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
