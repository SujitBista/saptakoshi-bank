import { z } from "zod";

const roleSchema = z.enum(["ADMIN", "MAKER", "CHECKER", "TELLER"]);
const statusSchema = z.enum(["active", "inactive"]);

export const userCreateFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .max(100, "Full name must be 100 characters or less"),
    username: z
      .string()
      .trim()
      .min(1, "Username is required")
      .max(50, "Username must be 50 characters or less"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .max(255, "Email must be 255 characters or less")
      .email("Enter a valid email address"),
    password: z.string().trim().min(1, "Temporary password is required"),
    branchId: z.string(),
    role: roleSchema,
    status: statusSchema,
  })
  .superRefine((values, context) => {
    if (
      (values.role === "MAKER" ||
        values.role === "CHECKER" ||
        values.role === "TELLER") &&
      !values.branchId
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Branch is required for ${values.role} role`,
        path: ["branchId"],
      });
    }
  });

export const userEditFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .max(100, "Full name must be 100 characters or less"),
    username: z
      .string()
      .trim()
      .min(1, "Username is required")
      .max(50, "Username must be 50 characters or less"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .max(255, "Email must be 255 characters or less")
      .email("Enter a valid email address"),
    branchId: z.string(),
    role: roleSchema,
    status: statusSchema,
  })
  .superRefine((values, context) => {
    if (
      (values.role === "MAKER" ||
        values.role === "CHECKER" ||
        values.role === "TELLER") &&
      !values.branchId
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Branch is required for ${values.role} role`,
        path: ["branchId"],
      });
    }
  });

export const resetPasswordSchema = z.object({
  password: z.string().trim().min(1, "Password is required"),
});

export const transferBranchSchema = z
  .object({
    branchId: z.string().trim().min(1, "New branch is required"),
    remarks: z.string().trim().max(500, "Remarks must be 500 characters or less"),
  })
  .superRefine((values, context) => {
    if (!values.branchId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New branch is required",
        path: ["branchId"],
      });
    }
  });

export type UserCreateFormSchemaValues = z.infer<typeof userCreateFormSchema>;
export type UserEditFormSchemaValues = z.infer<typeof userEditFormSchema>;
export type ResetPasswordSchemaValues = z.infer<typeof resetPasswordSchema>;
export type TransferBranchSchemaValues = z.infer<typeof transferBranchSchema>;
