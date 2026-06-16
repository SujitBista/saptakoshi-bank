import { apiClient } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import type {
  User,
  UserEditFormValues,
  UserFormValues,
  UserListResponse,
  UserResponse,
  UserSearchFilters,
} from "@/features/users/types";

function toCreatePayload(values: UserFormValues) {
  return {
    fullName: values.fullName.trim(),
    username: values.username.trim(),
    email: values.email.trim(),
    password: values.password,
    branchId: values.branchId ? Number(values.branchId) : null,
    role: values.role,
    isActive: values.status === "active",
  };
}

function toUpdatePayload(values: UserEditFormValues) {
  return {
    fullName: values.fullName.trim(),
    username: values.username.trim(),
    email: values.email.trim(),
    branchId: values.branchId ? Number(values.branchId) : null,
    role: values.role,
    isActive: values.status === "active",
  };
}

function buildSearchParams(filters: UserSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.branchId !== undefined) {
    params.set("branch_id", String(filters.branchId));
  }

  if (filters.role?.trim()) {
    params.set("role", filters.role.trim());
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.page !== undefined) {
    params.set("page", String(filters.page));
  }

  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchUsers(
  filters: UserSearchFilters = {}
): Promise<UserListResponse> {
  return apiClient<UserListResponse>(
    `/api/admin/users${buildSearchParams(filters)}`,
    { token: getToken() }
  );
}

export async function fetchUserById(id: number): Promise<User> {
  const response = await apiClient<UserResponse>(`/api/admin/users/${id}`, {
    token: getToken(),
  });

  return response.user;
}

export async function createUser(values: UserFormValues): Promise<User> {
  const response = await apiClient<UserResponse>("/api/admin/users", {
    method: "POST",
    body: toCreatePayload(values),
    token: getToken(),
  });

  return response.user;
}

export async function updateUser(
  id: number,
  values: UserEditFormValues
): Promise<User> {
  const response = await apiClient<UserResponse>(`/api/admin/users/${id}`, {
    method: "PUT",
    body: toUpdatePayload(values),
    token: getToken(),
  });

  return response.user;
}

export async function updateUserStatus(
  id: number,
  isActive: boolean
): Promise<User> {
  const response = await apiClient<UserResponse>(`/api/admin/users/${id}/status`, {
    method: "PATCH",
    body: { isActive },
    token: getToken(),
  });

  return response.user;
}

export async function resetUserPassword(
  id: number,
  password: string
): Promise<User> {
  const response = await apiClient<UserResponse>(
    `/api/admin/users/${id}/reset-password`,
    {
      method: "PATCH",
      body: { password },
      token: getToken(),
    }
  );

  return response.user;
}

export function userToEditFormValues(user: User): UserEditFormValues {
  return {
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    branchId: user.branchId ? String(user.branchId) : "",
    role: user.role as "ADMIN" | "USER",
    status: user.isActive ? "active" : "inactive",
  };
}

export function formatUserDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
