"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  userEditFormSchema,
  type UserEditFormSchemaValues,
} from "@/features/users/user-schema";
import type { BranchOption, UserEditFormValues } from "@/features/users/types";

const ROLE_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

interface UserEditFormProps {
  defaultValues: UserEditFormValues;
  branchOptions: BranchOption[];
  submitLabel: string;
  onSubmit: (values: UserEditFormValues) => Promise<void>;
  onCancel: () => void;
}

export function UserEditForm({
  defaultValues,
  branchOptions,
  submitLabel,
  onSubmit,
  onCancel,
}: UserEditFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserEditFormSchemaValues>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues,
  });

  const selectedRole = watch("role");

  async function handleFormSubmit(values: UserEditFormSchemaValues) {
    setApiError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
        return;
      }

      setApiError("Unable to save user. Please try again.");
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {apiError ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {apiError}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Full Name"
          placeholder="Enter full name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <Input
          label="Username"
          placeholder="Enter username"
          error={errors.username?.message}
          {...register("username")}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="user@saptakoshi.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Select
          label="Role"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          {...register("role")}
        />

        <Select
          label="Branch"
          options={[
            { value: "", label: "No branch" },
            ...branchOptions,
          ]}
          error={errors.branchId?.message}
          {...register("branchId")}
          disabled={selectedRole === "ADMIN"}
        />
      </div>

      <Select
        label="Status"
        options={STATUS_OPTIONS}
        error={errors.status?.message}
        {...register("status")}
      />

      <div className="flex justify-end gap-3 border-t border-brand-black-15 pt-5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
