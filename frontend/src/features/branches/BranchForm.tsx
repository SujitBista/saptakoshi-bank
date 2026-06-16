"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  branchFormSchema,
  type BranchFormSchemaValues,
} from "@/features/branches/branch-schema";
import type { BranchFormValues } from "@/features/branches/types";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

interface BranchFormProps {
  defaultValues: BranchFormValues;
  submitLabel: string;
  onSubmit: (values: BranchFormValues) => Promise<void>;
  onCancel: () => void;
}

export function BranchForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: BranchFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BranchFormSchemaValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues,
  });

  async function handleFormSubmit(values: BranchFormSchemaValues) {
    setApiError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
        return;
      }

      setApiError("Unable to save branch. Please try again.");
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
          label="Branch Code"
          placeholder="e.g. BRT001"
          error={errors.branchCode?.message}
          {...register("branchCode")}
        />

        <Input
          label="Branch Name"
          placeholder="Enter branch name"
          error={errors.branchName?.message}
          {...register("branchName")}
        />
      </div>

      <Textarea
        label="Address"
        rows={3}
        placeholder="Enter branch address"
        error={errors.address?.message}
        {...register("address")}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Phone Number"
          placeholder="Enter phone number"
          error={errors.phoneNumber?.message}
          {...register("phoneNumber")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="branch@saptakoshi.com"
          error={errors.email?.message}
          {...register("email")}
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
