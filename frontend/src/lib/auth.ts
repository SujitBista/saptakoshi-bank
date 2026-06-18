import type { AuthUser } from "@saptakoshi/shared";

const TOKEN_KEY = "saptakoshi_token";
const USER_KEY = "saptakoshi_user";
const LEGACY_TOKEN_KEY = "saptakoshi_admin_token";
const LEGACY_USER_KEY = "saptakoshi_admin_user";

function migrateLegacyStorage(): void {
  if (typeof window === "undefined") return;

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacyToken && !localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(TOKEN_KEY, legacyToken);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }

  const legacyUser = localStorage.getItem(LEGACY_USER_KEY);
  if (legacyUser && !localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, legacyUser);
    localStorage.removeItem(LEGACY_USER_KEY);
  }
}

export function saveToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  migrateLegacyStorage();
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function saveUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  migrateLegacyStorage();

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getDashboardPathForRole(role: string): string {
  return role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
}

export function getLoginPathForRole(role: string): string {
  return role === "ADMIN" ? "/admin/login" : "/login";
}
