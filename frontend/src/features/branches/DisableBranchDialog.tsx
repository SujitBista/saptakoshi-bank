"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api-client";
import { Dialog } from "@/components/ui/Dialog";
import { updateBranchStatus } from "@/features/branches/api";
import type { Branch } from "@/features/branches/types";

interface DisableBranchDialogProps {
  branch: Branch | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (branch: Branch) => void;
}

export function DisableBranchDialog({
  branch,
  open,
  onClose,
  onSuccess,
}: DisableBranchDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabling = branch?.isActive ?? true;

  async function handleConfirm() {
    if (!branch) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedBranch = await updateBranchStatus(branch.id, !branch.isActive);
      onSuccess(updatedBranch);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to update branch status. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    if (isLoading) return;
    setError(null);
    onClose();
  }

  return (
    <Dialog
      open={open}
      title={isDisabling ? "Disable Branch" : "Enable Branch"}
      description={
        branch
          ? isDisabling
            ? `Are you sure you want to disable ${branch.branchName} (${branch.branchCode})?`
            : `Are you sure you want to enable ${branch.branchName} (${branch.branchCode})?`
          : undefined
      }
      confirmLabel={isDisabling ? "Disable" : "Enable"}
      variant={isDisabling ? "danger" : "default"}
      isLoading={isLoading}
      onConfirm={handleConfirm}
      onClose={handleClose}
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
