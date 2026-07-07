"use client";

import { useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  dailyCashDenominationSchema,
  type DailyCashDenominationSchemaValues,
} from "@/features/daily-cash-denominations/daily-cash-denomination-schema";
import {
  DENOMINATION_ROWS,
  type DenominationCountField,
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
  isDisabled?: boolean;
  disabledMessage?: string | null;
}

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const defaultValues: DailyCashDenominationFormValues = {
  denominationDate: getLocalDateString(),
  thousandCount: "0",
  fiveHundredCount: "0",
  oneHundredCount: "0",
  fiftyCount: "0",
  twentyCount: "0",
  tenCount: "0",
  fiveCount: "0",
  twoCount: "0",
  oneCount: "0",
  coin10Count: "0",
  coin5Count: "0",
  coin2Count: "0",
  coin1Count: "0",
  notes: "",
};

type DenominationRow = {
  key: DenominationCountField;
  label: string;
  value: number;
};

const noteRows = DENOMINATION_ROWS.filter(
  (row) => !row.key.startsWith("coin")
) as readonly DenominationRow[];

const coinRows = DENOMINATION_ROWS.filter((row) =>
  row.key.startsWith("coin")
) as readonly DenominationRow[];

const denominationInputOrder = [...noteRows, ...coinRows];

function toCount(value: string): number {
  const normalized = value.trim();
  return normalized ? Number(normalized) : 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NP").format(value);
}

function formatDateOnly(dateString: string): string {
  const [year, month, day] = dateString.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = Number(month) - 1;

  if (!year || !month || !day || monthIndex < 0 || monthIndex > 11) {
    return dateString;
  }

  return `${day} ${monthNames[monthIndex]} ${year}`;
}

export function DailyCashDenominationForm({
  onSubmit,
  initialValues = defaultValues,
  onSuccess,
  submitLabel = "Save Denomination",
  successMessage: buildSuccessMessage = () =>
    "Daily cash denomination saved successfully.",
  onCancel,
  isDisabled = false,
  disabledMessage = null,
}: DailyCashDenominationFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const inputRefs = useRef<Record<DenominationCountField, HTMLInputElement | null>>({
    thousandCount: null,
    fiveHundredCount: null,
    oneHundredCount: null,
    fiftyCount: null,
    twentyCount: null,
    tenCount: null,
    fiveCount: null,
    twoCount: null,
    oneCount: null,
    coin10Count: null,
    coin5Count: null,
    coin2Count: null,
    coin1Count: null,
  });

  const {
    control,
    register,
    handleSubmit,
    getValues,
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

  const isFormDisabled = isDisabled || isSubmitting;

  function handleCountEnter(currentKey: DenominationCountField) {
    const currentIndex = denominationInputOrder.findIndex((row) => row.key === currentKey);
    const nextKey = denominationInputOrder[currentIndex + 1]?.key;

    if (!nextKey) {
      return;
    }

    inputRefs.current[nextKey]?.focus();
    inputRefs.current[nextKey]?.select();
  }

  function handleClearAll() {
    const currentValues = getValues();

    reset({
      ...currentValues,
      thousandCount: "0",
      fiveHundredCount: "0",
      oneHundredCount: "0",
      fiftyCount: "0",
      twentyCount: "0",
      tenCount: "0",
      fiveCount: "0",
      twoCount: "0",
      oneCount: "0",
      coin10Count: "0",
      coin5Count: "0",
      coin2Count: "0",
      coin1Count: "0",
    });
  }

  function renderDenominationSection(
    title: string,
    rows: readonly DenominationRow[]
  ) {
    return (
      <section className="rounded-2xl border border-brand-black-15 bg-white">
        <div className="border-b border-brand-black-10 px-4 py-3">
          <h3 className="text-sm font-semibold text-brand-blue">{title}</h3>
        </div>
        <div className="px-3 py-3 sm:px-4">
          <div className="grid grid-cols-[minmax(0,1fr)_6.5rem_minmax(0,8.5rem)] gap-2 px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-brand-black-60">
            <div>Denomination</div>
            <div className="text-right">Count</div>
            <div className="text-right">Amount</div>
          </div>
          <div className="space-y-2">
            {rows.map((row) => {
              const registration = register(row.key);
              const amount = rowAmounts[row.key] ?? 0;

              return (
                <div
                  key={row.key}
                  className="grid grid-cols-[minmax(0,1fr)_6.5rem_minmax(0,8.5rem)] items-start gap-2 rounded-xl border border-brand-black-10 bg-brand-blue-05/40 px-2 py-2 sm:px-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-black">{row.label}</p>
                    <p className="text-xs text-brand-black-60">
                      {formatCurrency(row.value)} per unit
                    </p>
                  </div>

                  <div className="space-y-1">
                    <input
                      {...registration}
                      ref={(element) => {
                        registration.ref(element);
                        inputRefs.current[row.key] = element;
                      }}
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      disabled={isFormDisabled}
                      className={`block h-11 w-full rounded-lg border bg-white px-2.5 text-right text-base text-brand-black shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/20 sm:h-10 sm:text-sm ${
                        errors[row.key]
                          ? "border-red-400 focus:border-red-500"
                          : "border-brand-black-15 focus:border-brand-blue"
                      } ${isFormDisabled ? "cursor-not-allowed bg-brand-black-05 text-brand-black-60" : ""}`}
                      onFocus={(event) => {
                        if (event.currentTarget.value === "0") {
                          event.currentTarget.select();
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleCountEnter(row.key);
                        }
                      }}
                    />
                    {errors[row.key] ? (
                      <p className="text-right text-xs text-red-600">
                        {errors[row.key]?.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="pt-2 text-right">
                    <p className="text-sm font-semibold text-brand-black">
                      {formatCurrency(amount)}
                    </p>
                    <p className="text-xs text-brand-black-60">
                      {toCount(watchedValues[row.key] ?? "0")} x {row.label} ={" "}
                      {formatCurrency(amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

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
      {disabledMessage ? (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
          role="alert"
        >
          {disabledMessage}
        </div>
      ) : null}

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="order-2 space-y-4 lg:order-1">
          {renderDenominationSection("Notes", noteRows)}
          {renderDenominationSection("Coins", coinRows)}

          <section className="rounded-2xl border border-brand-black-15 bg-white p-4">
            <Textarea
              label="Notes"
              rows={4}
              placeholder="Add notes if needed"
              error={errors.notes?.message}
              disabled={isFormDisabled}
              {...register("notes")}
            />
          </section>
        </div>

        <aside className="order-1 lg:order-2">
          <div className="rounded-2xl border border-brand-blue-15 bg-brand-blue-05 p-4 shadow-sm lg:sticky lg:top-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <input
                  id="denominationDate"
                  type="date"
                  aria-hidden="true"
                  tabIndex={-1}
                  disabled={isFormDisabled}
                  className="sr-only"
                  {...register("denominationDate")}
                />
                <div className="rounded-xl border border-brand-blue-15 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-black-60">
                    Denomination Date
                  </p>
                  <p className="mt-2 text-right text-lg font-semibold text-brand-black">
                    {formatDateOnly(watchedValues.denominationDate ?? defaultValues.denominationDate)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-brand-blue-15 bg-white px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-black-60">
                  Grand Total
                </p>
                <p className="mt-2 text-right text-3xl font-bold text-brand-blue">
                  {formatCurrency(grandTotal)}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleClearAll}
                disabled={isFormDisabled}
              >
                Clear All
              </Button>

              <div className="space-y-3 border-t border-brand-blue-15 pt-4">
                {onCancel ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                ) : null}
                <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isDisabled}>
                  {submitLabel}
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
