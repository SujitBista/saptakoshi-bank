export const APP_NAME = "Saptakoshi Bank";

export const API_VERSION = "v1";

export const USER_ROLES = {
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE",
  BRANCH_MANAGER: "BRANCH_MANAGER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

const LEGACY_USER_ROLE = "USER";

export function normalizeUserRole(role: string): UserRole {
  if (role === LEGACY_USER_ROLE) {
    return USER_ROLES.EMPLOYEE;
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
