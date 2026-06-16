export const APP_NAME = "Saptakoshi Bank";

export const API_VERSION = "v1";

export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
