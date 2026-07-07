"use client";

import { z } from "zod";

export const ownPasswordResetSchema = z
  .object({
    currentPassword: z.string().trim().min(1, "Current password is required"),
    newPassword: z.string().trim().min(1, "New password is required"),
    confirmPassword: z.string().trim().min(1, "Please confirm the new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type OwnPasswordResetSchemaValues = z.infer<typeof ownPasswordResetSchema>;
