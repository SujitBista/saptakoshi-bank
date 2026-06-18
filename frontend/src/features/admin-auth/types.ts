export type { AuthUser, LoginResponse } from "@saptakoshi/shared";

/** @deprecated Use AuthUser from @saptakoshi/shared */
export type AdminUser = import("@saptakoshi/shared").AuthUser;

/** @deprecated Use LoginResponse from @saptakoshi/shared */
export type AdminLoginResponse = import("@saptakoshi/shared").LoginResponse;
