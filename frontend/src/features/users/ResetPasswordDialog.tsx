"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-client";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { resetUserPassword } from "@/features/users/api";
import {
  resetPasswordSchema,
  type ResetPasswordSchemaValues,
} from "@/features/users/user-schema";
import type { User } from "@/features/users/types";

interface ResetPasswordDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ResetPasswordDialog({
  user,
  open,
  onClose,
  onSuccess,
}: ResetPasswordDialogProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchemaValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  async function handleFormSubmit(values: ResetPasswordSchemaValues) {
    if (!user) return;

    setApiError(null);

    try {
      await resetUserPassword(user.id, values.password);
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
        return;
      }

      setApiError("Unable to reset password. Please try again.");
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    setApiError(null);
    reset();
    onClose();
  }

  return (
    <Dialog
      open={open}
      title="Reset Password"
      description={
        user
          ? `Set a new temporary password for ${user.fullName} (${user.email}).`
          : undefined
      }
      confirmLabel="Reset Password"
      isLoading={isSubmitting}
      onConfirm={handleSubmit(handleFormSubmit)}
      onClose={handleClose}
    >
      <div className="space-y-4">
        {apiError ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {apiError}
          </div>
        ) : null}

        <Input
          label="New Temporary Password"
          type="password"
          placeholder="Enter new password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>
    </Dialog>
  );
}
