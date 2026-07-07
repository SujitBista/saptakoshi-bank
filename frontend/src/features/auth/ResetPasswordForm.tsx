"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { AuthUser } from "@saptakoshi/shared";
import { ApiError } from "@/lib/api-client";
import {
  getDashboardPathForRole,
  saveUser,
} from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { resetOwnPassword } from "@/features/auth/api";
import {
  ownPasswordResetSchema,
  type OwnPasswordResetSchemaValues,
} from "@/features/auth/reset-password-schema";

interface ResetPasswordFormProps {
  user: AuthUser;
}

export function ResetPasswordForm({ user }: ResetPasswordFormProps) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OwnPasswordResetSchemaValues>({
    resolver: zodResolver(ownPasswordResetSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function handleFormSubmit(values: OwnPasswordResetSchemaValues) {
    setApiError(null);
    setStatusMessage(null);

    try {
      const updatedUser = await resetOwnPassword(
        values.currentPassword,
        values.newPassword
      );

      saveUser(updatedUser);
      reset();
      setStatusMessage("Password updated successfully.");

      if (user.mustResetPassword) {
        router.replace(getDashboardPathForRole(updatedUser.role));
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
        return;
      }

      setApiError("Unable to update password. Please try again.");
    }
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader
        title="Reset Password"
        description={
          user.mustResetPassword
            ? "You must reset your temporary password before continuing."
            : "Update your password for your current account."
        }
      />
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          {apiError ? (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {apiError}
            </div>
          ) : null}

          {statusMessage ? (
            <div
              className="rounded-lg border border-brand-green-15 bg-brand-green-05 px-4 py-3 text-sm text-brand-black"
              role="status"
            >
              <p className="font-medium text-brand-green">{statusMessage}</p>
            </div>
          ) : null}

          <Input
            label="Current Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter current password"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />

          <Input
            label="New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter new password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          <Input
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
