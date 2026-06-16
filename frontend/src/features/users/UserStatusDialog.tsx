"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api-client";
import { Dialog } from "@/components/ui/Dialog";
import { updateUserStatus } from "@/features/users/api";
import type { User } from "@/features/users/types";

interface UserStatusDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function UserStatusDialog({
  user,
  open,
  onClose,
  onSuccess,
}: UserStatusDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabling = user?.isActive ?? true;

  async function handleConfirm() {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await updateUserStatus(user.id, !user.isActive);
      onSuccess(updatedUser);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to update user status. Please try again.");
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
      title={isDisabling ? "Disable User" : "Enable User"}
      description={
        user
          ? isDisabling
            ? `Are you sure you want to disable ${user.fullName} (${user.email})?`
            : `Are you sure you want to enable ${user.fullName} (${user.email})?`
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
