import { apiClient, getApiBaseUrl } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import type {
  Policy,
  PolicyFormValues,
  PolicyListResponse,
  PolicyResponse,
  PolicySearchFilters,
} from "@/features/policies/types";

function buildSearchParams(filters: PolicySearchFilters): string {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
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

export async function fetchPolicies(
  filters: PolicySearchFilters = {}
): Promise<PolicyListResponse> {
  return apiClient<PolicyListResponse>(`/api/policies${buildSearchParams(filters)}`);
}

export async function fetchPolicyById(id: number): Promise<Policy> {
  const response = await apiClient<PolicyResponse>(`/api/policies/${id}`);
  return response.policy;
}

export async function createPolicy(values: PolicyFormValues): Promise<Policy> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<PolicyResponse>("/api/admin/policies", {
    method: "POST",
    body: formData,
    token: getToken(),
  });

  return response.policy;
}

export async function updatePolicy(id: number, values: PolicyFormValues): Promise<Policy> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<PolicyResponse>(`/api/admin/policies/${id}`, {
    method: "PUT",
    body: formData,
    token: getToken(),
  });

  return response.policy;
}

export async function deletePolicy(id: number): Promise<void> {
  await apiClient<void>(`/api/admin/policies/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}

export async function getPolicyViewObjectUrl(id: number): Promise<string> {
  const response = await fetch(`${getApiBaseUrl()}/api/policies/${id}/view`, {
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Unable to load policy PDF");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function formatPolicyDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: value.includes("T") ? "2-digit" : undefined,
    minute: value.includes("T") ? "2-digit" : undefined,
  }).format(new Date(value));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function policyToFormValues(policy: Policy): PolicyFormValues {
  return {
    title: policy.title,
  };
}
