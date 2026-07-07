export const APP_NAME = "Saptakoshi Bank";

export const API_VERSION = "v1";

export const USER_ROLES = {
  ADMIN: "ADMIN",
  MAKER: "MAKER",
  CHECKER: "CHECKER",
  TELLER: "TELLER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

const LEGACY_USER_ROLE = "USER";
const LEGACY_EMPLOYEE_ROLE = "EMPLOYEE";
const LEGACY_BRANCH_MANAGER_ROLE = "BRANCH_MANAGER";

export function normalizeUserRole(role: string): UserRole {
  if (role === LEGACY_USER_ROLE || role === LEGACY_EMPLOYEE_ROLE) {
    return USER_ROLES.MAKER;
  }

  if (role === LEGACY_BRANCH_MANAGER_ROLE) {
    return USER_ROLES.CHECKER;
  }

  return role as UserRole;
}

export const DOCUMENT_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type DocumentStatus =
  (typeof DOCUMENT_STATUSES)[keyof typeof DOCUMENT_STATUSES];

export const PRODUCT_PAPER_CATEGORIES = {
  DEPOSIT: "DEPOSIT",
  CREDIT: "CREDIT",
} as const;

export type ProductPaperCategory =
  (typeof PRODUCT_PAPER_CATEGORIES)[keyof typeof PRODUCT_PAPER_CATEGORIES];
