"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/Table";
import { Textarea } from "@/components/ui/Textarea";
import {
  dailyCashDenominationSchema,
  type DailyCashDenominationSchemaValues,
} from "@/features/daily-cash-denominations/daily-cash-denomination-schema";
import {
  DENOMINATION_ROWS,
  type DailyCashDenomination,
  type DailyCashDenominationFormValues,
} from "@/features/daily-cash-denominations/types";

interface DailyCashDenominationFormProps {
  onSubmit: (
    values: DailyCashDenominationFormValues
  ) => Promise<DailyCashDenomination>;
  initialValues?: DailyCashDenominationFormValues;
  onSuccess?: (denomination: DailyCashDenomination) => void | Promise<void>;
  submitLabel?: string;
  successMessage?: (denomination: DailyCashDenomination) => string;
  onCancel?: () => void;
}

const defaultValues: DailyCashDenominationFormValues = {
  denominationDate: new Date().toISOString().slice(0, 10),
  thousandCount: "",
  fiveHundredCount: "",
  oneHundredCount: "",
  fiftyCount: "",
  twentyCount: "",
  tenCount: "",
  fiveCount: "",
  twoCount: "",
  oneCount: "",
  coin10Count: "",
  coin5Count: "",
  coin2Count: "",
  coin1Count: "",
  notes: "",
};

function toCount(value: string): number {
  const normalized = value.trim();
  return normalized ? Number(normalized) : 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NP").format(value);
}

export function DailyCashDenominationForm({
  onSubmit,
  initialValues = defaultValues,
  onSuccess,
  submitLabel = "Save Denomination",
  successMessage: buildSuccessMessage = (denomination) =>
    `Daily cash denomination saved successfully for ${denomination.denominationDate}.`,
  onCancel,
}: DailyCashDenominationFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DailyCashDenominationSchemaValues>({
    resolver: zodResolver(dailyCashDenominationSchema),
    defaultValues: initialValues,
  });

  const watchedValues = useWatch({
    control,
  });

  const rowAmounts = useMemo(() => {
    return DENOMINATION_ROWS.reduce<Record<string, number>>((accumulator, row) => {
      accumulator[row.key] = toCount(watchedValues[row.key] ?? "") * row.value;
      return accumulator;
    }, {});
  }, [watchedValues]);

  const grandTotal = useMemo(() => {
    return Object.values(rowAmounts).reduce((sum, value) => sum + value, 0);
  }, [rowAmounts]);

  async function handleFormSubmit(values: DailyCashDenominationSchemaValues) {
    setApiError(null);
    setStatusMessage(null);

    try {
      const denomination = await onSubmit(values);
      await onSuccess?.(denomination);
      setStatusMessage(buildSuccessMessage(denomination));

      if (onCancel) {
        return;
      }

      reset({
        ...defaultValues,
        denominationDate: values.denominationDate,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
        return;
      }

      setApiError("Unable to save daily cash denomination. Please try again.");
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
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

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="denominationDate"
            className="block text-sm font-medium text-brand-black-75"
          >
            Denomination Date
          </label>
          <input
            id="denominationDate"
            type="date"
            className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-brand-black shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/20 ${
              errors.denominationDate
                ? "border-red-400 focus:border-red-500"
                : "border-brand-black-15 focus:border-brand-blue"
            }`}
            {...register("denominationDate")}
          />
          {errors.denominationDate ? (
            <p className="text-sm text-red-600">{errors.denominationDate.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-brand-black-75">
            Grand Total
          </label>
          <input
            readOnly
            value={formatCurrency(grandTotal)}
            className="block w-full rounded-lg border border-brand-black-15 bg-brand-blue-05 px-3.5 py-2.5 text-right text-sm font-semibold text-brand-black shadow-sm"
          />
        </div>
      </div>

      <Table>
        <TableHead>
          <TableRow className="hover:bg-transparent">
            <TableHeaderCell>Denomination</TableHeaderCell>
            <TableHeaderCell className="text-right">Count</TableHeaderCell>
            <TableHeaderCell className="text-right">Amount</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {DENOMINATION_ROWS.map((row) => (
            <TableRow key={row.key}>
              <TableCell>{row.label}</TableCell>
              <TableCell className="align-top">
                <div className="space-y-1">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-right text-sm text-brand-black shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/20 ${
                      errors[row.key]
                        ? "border-red-400 focus:border-red-500"
                        : "border-brand-black-15 focus:border-brand-blue"
                    }`}
                    {...register(row.key)}
                  />
                  {errors[row.key] ? (
                    <p className="text-right text-sm text-red-600">
                      {errors[row.key]?.message}
                    </p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(rowAmounts[row.key] ?? 0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Textarea
        label="Notes"
        rows={4}
        placeholder="Add notes if needed"
        error={errors.notes?.message}
        {...register("notes")}
      />

      <div className="flex justify-end gap-3 border-t border-brand-black-15 pt-5">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
