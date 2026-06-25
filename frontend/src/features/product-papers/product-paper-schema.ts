import { z } from "zod";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

function isPdfFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  return file.type === "application/pdf" || fileName.endsWith(".pdf");
}

const baseSchema = z.object({
  category: z.enum(["DEPOSIT", "CREDIT"], {
    error: "Category is required",
  }),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or less"),
});

export const createProductPaperSchema = baseSchema.extend({
  document: z
    .custom<FileList>((value) => value instanceof FileList && value.length > 0, {
      error: "PDF document is required",
    })
    .refine((value) => value.length > 0 && isPdfFile(value[0]), {
      error: "Only PDF files are allowed",
    })
    .refine((value) => value.length > 0 && value[0].size <= MAX_FILE_SIZE_BYTES, {
      error: "File size must be 2 MB or less",
    }),
});

export const updateProductPaperSchema = baseSchema;
export const updateProductPaperFormSchema = updateProductPaperSchema.extend({
  document: z.custom<FileList | undefined>().optional(),
});

export type CreateProductPaperSchemaValues = z.infer<typeof createProductPaperSchema>;
export type UpdateProductPaperSchemaValues = z.infer<typeof updateProductPaperFormSchema>;
