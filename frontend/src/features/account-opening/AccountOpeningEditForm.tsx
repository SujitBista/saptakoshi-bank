"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  accountOpeningEditSchema,
  type AccountOpeningEditSchemaValues,
} from "@/features/account-opening/account-opening-edit-schema";
import type {
  AccountOpeningDocument,
  AccountOpeningEditFormValues,
} from "@/features/account-opening/types";

interface AccountOpeningEditFormProps {
  document: AccountOpeningDocument;
  onSubmit: (values: AccountOpeningEditFormValues) => Promise<void>;
  onCancel: () => void;
}

export function AccountOpeningEditForm({
  document,
  onSubmit,
  onCancel,
}: AccountOpeningEditFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountOpeningEditSchemaValues>({
    resolver: zodResolver(accountOpeningEditSchema),
    defaultValues: {
      firstName: document.firstName,
      lastName: document.lastName,
      fatherName: document.fatherName ?? "",
      citizenNo: document.citizenNo,
      mobileNumber: document.mobileNumber,
    },
  });

  async function handleFormSubmit(values: AccountOpeningEditSchemaValues) {
    setApiError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
        return;
      }

      setApiError("Unable to update document. Please try again.");
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Document No." value={document.documentNo} readOnly />
        <Input label="Client Code" value={document.clientCode} readOnly />
        <Input label="Branch Code" value={document.branchCode} readOnly />
        <Input label="Branch Name" value={document.branchName} readOnly />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="First Name"
          placeholder="Enter first name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />

        <Input
          label="Last Name"
          placeholder="Enter last name"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Father Name"
          placeholder="Enter father name"
          error={errors.fatherName?.message}
          {...register("fatherName")}
        />

        <Input
          label="Citizen No."
          placeholder="Enter citizen number"
          error={errors.citizenNo?.message}
          {...register("citizenNo")}
        />
      </div>

      <Input
        label="Mobile Number"
        placeholder="Enter mobile number"
        error={errors.mobileNumber?.message}
        {...register("mobileNumber")}
      />

      <div className="space-y-1.5">
        <label
          htmlFor="account-opening-edit-file"
          className="block text-sm font-medium text-brand-black-75"
        >
          Replace PDF (optional)
        </label>
        <input
          id="account-opening-edit-file"
          type="file"
          accept=".pdf,application/pdf"
          className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-brand-black shadow-sm transition-colors file:mr-3 file:rounded-md file:border-0 file:bg-brand-blue file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/20 ${
            errors.file
              ? "border-red-400 focus:border-red-500"
              : "border-brand-black-15 focus:border-brand-blue"
          }`}
          {...register("file")}
        />
        <p className="text-xs text-brand-black-50">
          Current file: {document.originalFileName}. Leave empty to keep the
          existing PDF. Maximum file size: 2 MB.
        </p>
        {errors.file ? <p className="text-sm text-red-600">{errors.file.message}</p> : null}
      </div>

      <div className="flex justify-end gap-3 border-t border-brand-black-15 pt-5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
