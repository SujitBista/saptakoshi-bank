import { z } from "zod";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

function isPdfFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  return file.type === "application/pdf" || fileName.endsWith(".pdf");
}

const baseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
});

export const createOperationTrainingMaterialSchema = baseSchema.extend({
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

export const updateOperationTrainingMaterialFormSchema = baseSchema.extend({
  document: z
    .custom<FileList | undefined>()
    .optional()
    .refine(
      (value) => !value || value.length === 0 || isPdfFile(value[0]),
      { error: "Only PDF files are allowed" }
    )
    .refine(
      (value) => !value || value.length === 0 || value[0].size <= MAX_FILE_SIZE_BYTES,
      { error: "File size must be 2 MB or less" }
    ),
});

export type CreateOperationTrainingMaterialSchemaValues = z.infer<typeof createOperationTrainingMaterialSchema>;
export type UpdateOperationTrainingMaterialSchemaValues = z.infer<typeof updateOperationTrainingMaterialFormSchema>;
