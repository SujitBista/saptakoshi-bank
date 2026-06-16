import { apiClient } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import type {
  Branch,
  BranchFormValues,
  BranchListResponse,
  BranchPagination,
  BranchResponse,
  BranchSearchFilters,
} from "@/features/branches/types";

function toApiPayload(values: BranchFormValues) {
  return {
    branchCode: values.branchCode.trim().toUpperCase(),
    branchName: values.branchName.trim(),
    address: values.address.trim() || null,
    phoneNumber: values.phoneNumber.trim() || null,
    email: values.email.trim() || null,
    isActive: values.status === "active",
  };
}

function buildSearchParams(filters: BranchSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.branchCode?.trim()) {
    params.set("branchCode", filters.branchCode.trim());
  }

  if (filters.branchName?.trim()) {
    params.set("branchName", filters.branchName.trim());
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

export async function fetchBranches(
  filters: BranchSearchFilters = {}
): Promise<{ branches: Branch[]; pagination: BranchPagination }> {
  const response = await apiClient<BranchListResponse>(
    `/api/admin/branches${buildSearchParams(filters)}`,
    { token: getToken() }
  );

  return {
    branches: response.branches,
    pagination: response.pagination,
  };
}

export async function fetchBranchById(id: number): Promise<Branch> {
  const response = await apiClient<BranchResponse>(`/api/admin/branches/${id}`, {
    token: getToken(),
  });

  return response.branch;
}

export async function createBranch(values: BranchFormValues): Promise<Branch> {
  const response = await apiClient<BranchResponse>("/api/admin/branches", {
    method: "POST",
    body: toApiPayload(values),
    token: getToken(),
  });

  return response.branch;
}

export async function updateBranch(
  id: number,
  values: BranchFormValues
): Promise<Branch> {
  const response = await apiClient<BranchResponse>(`/api/admin/branches/${id}`, {
    method: "PUT",
    body: toApiPayload(values),
    token: getToken(),
  });

  return response.branch;
}

export async function updateBranchStatus(
  id: number,
  isActive: boolean
): Promise<Branch> {
  const response = await apiClient<BranchResponse>(
    `/api/admin/branches/${id}/status`,
    {
      method: "PATCH",
      body: { isActive },
      token: getToken(),
    }
  );

  return response.branch;
}

export function branchToFormValues(branch: Branch): BranchFormValues {
  return {
    branchCode: branch.branchCode,
    branchName: branch.branchName,
    address: branch.address ?? "",
    phoneNumber: branch.phoneNumber ?? "",
    email: branch.email ?? "",
    status: branch.isActive ? "active" : "inactive",
  };
}

export function formatBranchDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
