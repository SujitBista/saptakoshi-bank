"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  accountOpeningUploadSchema,
  type AccountOpeningUploadSchemaValues,
} from "@/features/account-opening/account-opening-upload-schema";
import type {
  AccountOpeningDocument,
  AccountOpeningUploadFormValues,
} from "@/features/account-opening/types";

interface AccountOpeningUploadFormProps {
  branchCode: string;
  onSubmit: (
    values: AccountOpeningUploadFormValues
  ) => Promise<AccountOpeningDocument>;
  onUploadSuccess?: () => void;
}

const defaultValues: Omit<AccountOpeningUploadFormValues, "file"> = {
  clientCode: "",
  firstName: "",
  lastName: "",
  fatherName: "",
  citizenNo: "",
  mobileNumber: "",
};

export function AccountOpeningUploadForm({
  branchCode,
  onSubmit,
  onUploadSuccess,
}: AccountOpeningUploadFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successDocumentNo, setSuccessDocumentNo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountOpeningUploadSchemaValues>({
    resolver: zodResolver(accountOpeningUploadSchema),
    defaultValues: {
      ...defaultValues,
    },
  });

  async function handleFormSubmit(values: AccountOpeningUploadSchemaValues) {
    setApiError(null);
    setSuccessDocumentNo(null);

    try {
      const document = await onSubmit(values);
      setSuccessDocumentNo(document.documentNo);
      reset(defaultValues);
      onUploadSuccess?.();
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
        return;
      }

      setApiError("Unable to upload document. Please try again.");
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

      {successDocumentNo ? (
        <div
          className="rounded-lg border border-brand-green-15 bg-brand-green-05 px-4 py-3 text-sm text-brand-black"
          role="status"
        >
          <p className="font-medium text-brand-green">Document uploaded successfully.</p>
          <p className="mt-1">Document No: {successDocumentNo}</p>
        </div>
      ) : null}

      <Input label="Login Branch Code" value={branchCode} readOnly />

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Client Code"
          placeholder="Enter client code"
          error={errors.clientCode?.message}
          {...register("clientCode")}
        />

        <Input
          label="Citizen No."
          placeholder="Enter citizen number"
          error={errors.citizenNo?.message}
          {...register("citizenNo")}
        />
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
          label="Mobile Number"
          placeholder="Enter mobile number"
          error={errors.mobileNumber?.message}
          {...register("mobileNumber")}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="account-opening-file"
          className="block text-sm font-medium text-brand-black-75"
        >
          File Upload
        </label>
        <input
          id="account-opening-file"
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
          Allowed type: PDF only. Maximum file size: 2 MB.
        </p>
        {errors.file ? <p className="text-sm text-red-600">{errors.file.message}</p> : null}
      </div>

      <div className="flex justify-end border-t border-brand-black-15 pt-5">
        <Button type="submit" isLoading={isSubmitting}>
          Upload Document
        </Button>
      </div>
    </form>
  );
}
