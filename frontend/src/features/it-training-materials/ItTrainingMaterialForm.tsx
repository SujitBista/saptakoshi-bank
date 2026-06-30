"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createItTrainingMaterialSchema,
  updateItTrainingMaterialFormSchema,
  type CreateItTrainingMaterialSchemaValues,
  type UpdateItTrainingMaterialSchemaValues,
} from "@/features/it-training-materials/it-training-material-schema";

type ItTrainingMaterialFormValues =
  | CreateItTrainingMaterialSchemaValues
  | UpdateItTrainingMaterialSchemaValues;

interface ItTrainingMaterialFormProps {
  mode: "create" | "edit";
  defaultValues: ItTrainingMaterialFormValues;
  currentFileName?: string;
  submitLabel: string;
  onSubmit: (values: ItTrainingMaterialFormValues) => Promise<void>;
  onCancel: () => void;
}

export function ItTrainingMaterialForm({
  mode,
  defaultValues,
  currentFileName,
  submitLabel,
  onSubmit,
  onCancel,
}: ItTrainingMaterialFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const schema =
    mode === "create" ? createItTrainingMaterialSchema : updateItTrainingMaterialFormSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ItTrainingMaterialFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function handleFormSubmit(values: ItTrainingMaterialFormValues) {
    setApiError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
        return;
      }

      setApiError(
        mode === "create"
          ? "Unable to upload IT training material. Please try again."
          : "Unable to update IT training material. Please try again."
      );
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

      <Input
        label="Title"
        placeholder="Enter IT training material title"
        error={errors.title?.message}
        {...register("title")}
      />

      <div className="space-y-1.5">
        <label
          htmlFor="it-training-material-document"
          className="block text-sm font-medium text-brand-black-75"
        >
          PDF Document
        </label>
        {mode === "edit" && currentFileName ? (
          <p className="text-sm text-brand-black-75">
            Current file: <span className="font-medium text-brand-black">{currentFileName}</span>
          </p>
        ) : null}
        <input
          id="it-training-material-document"
          type="file"
          accept=".pdf,application/pdf"
          className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-brand-black shadow-sm transition-colors file:mr-3 file:rounded-md file:border-0 file:bg-brand-blue file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/20 ${
            errors.document
              ? "border-red-400 focus:border-red-500"
              : "border-brand-black-15 focus:border-brand-blue"
          }`}
          {...register("document")}
        />
        <p className="text-xs text-brand-black-50">
          Allowed type: PDF only. Maximum file size: 2 MB.
          {mode === "edit" ? " Leave empty to keep the current PDF." : ""}
        </p>
        {errors.document ? (
          <p className="text-sm text-red-600">{errors.document.message}</p>
        ) : null}
      </div>

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
