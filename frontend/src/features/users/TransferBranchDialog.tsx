"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-client";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { transferUserBranch } from "@/features/users/api";
import {
  transferBranchSchema,
  type TransferBranchSchemaValues,
} from "@/features/users/user-schema";
import type { BranchOption, User } from "@/features/users/types";

interface TransferBranchDialogProps {
  user: User | null;
  branchOptions: BranchOption[];
  open: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function TransferBranchDialog({
  user,
  branchOptions,
  open,
  onClose,
  onSuccess,
}: TransferBranchDialogProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const availableBranchOptions = useMemo(() => {
    if (!user?.branchId) {
      return branchOptions;
    }

    return branchOptions.filter((option) => option.value !== String(user.branchId));
  }, [branchOptions, user?.branchId]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransferBranchSchemaValues>({
    resolver: zodResolver(transferBranchSchema),
    defaultValues: {
      branchId: "",
      remarks: "",
    },
  });

  const selectedBranchId = watch("branchId");
  const selectedBranch = availableBranchOptions.find(
    (option) => option.value === selectedBranchId
  );

  useEffect(() => {
    if (!open) return;

    reset({
      branchId: "",
      remarks: "",
    });
    setApiError(null);
  }, [open, reset, user?.id]);

  async function handleFormSubmit(values: TransferBranchSchemaValues) {
    if (!user) return;

    setApiError(null);

    try {
      const updatedUser = await transferUserBranch(
        user.id,
        Number(values.branchId),
        values.remarks
      );
      onSuccess(updatedUser);
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
        return;
      }

      setApiError("Unable to transfer user. Please try again.");
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
      title="Transfer Branch"
      description={
        user
          ? `Transfer ${user.fullName} (${user.email}) to a different branch.`
          : undefined
      }
      confirmLabel="Save Transfer"
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

        <div className="rounded-xl border border-brand-blue-15 bg-brand-blue-05 px-4 py-3 text-sm">
          <p className="font-medium text-brand-black">Current Branch</p>
          <p className="mt-1 text-brand-black-75">
            {user?.branchCode && user?.branchName
              ? `${user.branchCode} — ${user.branchName}`
              : "—"}
          </p>
        </div>

        <Select
          label="New Branch"
          options={[
            { value: "", label: "Select a branch" },
            ...availableBranchOptions,
          ]}
          error={errors.branchId?.message}
          value={selectedBranchId}
          onChange={(event) =>
            setValue("branchId", event.target.value, { shouldValidate: true })
          }
        />

        {selectedBranch ? (
          <div className="rounded-xl border border-brand-blue-15 bg-brand-blue-05 px-4 py-3 text-sm">
            <p className="font-medium text-brand-black">New Branch</p>
            <p className="mt-1 text-brand-black-75">{selectedBranch.label}</p>
          </div>
        ) : null}

        <Textarea
          label="Remarks (optional)"
          placeholder="Reason for transfer"
          rows={3}
          error={errors.remarks?.message}
          {...register("remarks")}
        />
      </div>
    </Dialog>
  );
}
