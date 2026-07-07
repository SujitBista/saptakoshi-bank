import { z } from "zod";
import { DENOMINATION_ROWS } from "@/features/daily-cash-denominations/types";

const countFieldSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d+$/.test(value), {
    message: "Enter a whole number greater than or equal to 0",
  });

const countShape = Object.fromEntries(
  DENOMINATION_ROWS.map((row) => [row.key, countFieldSchema])
) as Record<(typeof DENOMINATION_ROWS)[number]["key"], typeof countFieldSchema>;

export const dailyCashDenominationSchema = z.object({
  denominationDate: z
    .string()
    .trim()
    .min(1, "Denomination date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  ...countShape,
  notes: z.string().trim().max(1000, "Notes must be 1000 characters or less"),
});

export type DailyCashDenominationSchemaValues = z.infer<
  typeof dailyCashDenominationSchema
>;
