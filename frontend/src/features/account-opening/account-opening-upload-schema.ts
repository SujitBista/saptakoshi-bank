import { z } from "zod";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const allowedMimeTypes = ["application/pdf"];
const allowedExtensions = [".pdf"];

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot >= 0 ? fileName.slice(lastDot).toLowerCase() : "";
}

export const accountOpeningUploadSchema = z.object({
  clientCode: z
    .string()
    .trim()
    .min(1, "Client Code is required")
    .max(50, "Client Code must be 50 characters or less"),
  firstName: z
    .string()
    .trim()
    .min(1, "First Name is required")
    .max(100, "First Name must be 100 characters or less"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last Name is required")
    .max(100, "Last Name must be 100 characters or less"),
  fatherName: z
    .string()
    .trim()
    .max(100, "Father Name must be 100 characters or less"),
  citizenNo: z
    .string()
    .trim()
    .min(1, "Citizen No. is required")
    .max(50, "Citizen No. must be 50 characters or less"),
  mobileNumber: z
    .string()
    .trim()
    .min(1, "Mobile Number is required")
    .max(20, "Mobile Number must be 20 characters or less"),
  file: z
    .custom<FileList>((value) => value instanceof FileList && value.length > 0, {
      message: "File is required",
    })
    .refine((value) => value.length > 0, "File is required")
    .refine((value) => value[0]?.size <= MAX_FILE_SIZE_BYTES, {
      message: "File size must be 2 MB or less",
    })
    .refine((value) => allowedMimeTypes.includes(value[0]?.type ?? ""), {
      message: "Only PDF files are allowed",
    })
    .refine((value) => allowedExtensions.includes(getFileExtension(value[0]?.name ?? "")), {
      message: "Only PDF files are allowed",
    }),
});

export type AccountOpeningUploadSchemaValues = z.infer<
  typeof accountOpeningUploadSchema
>;
