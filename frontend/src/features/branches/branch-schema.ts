import { z } from "zod";

export const branchFormSchema = z.object({
  branchCode: z
    .string()
    .trim()
    .min(1, "Branch code is required")
    .max(20, "Branch code must be 20 characters or less"),
  branchName: z
    .string()
    .trim()
    .min(1, "Branch name is required")
    .max(200, "Branch name must be 200 characters or less"),
  address: z.string().trim().max(500, "Address must be 500 characters or less"),
  phoneNumber: z
    .string()
    .trim()
    .max(30, "Phone number must be 30 characters or less"),
  email: z
    .string()
    .trim()
    .max(255, "Email must be 255 characters or less")
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address",
    }),
  status: z.enum(["active", "inactive"]),
});

export type BranchFormSchemaValues = z.infer<typeof branchFormSchema>;
