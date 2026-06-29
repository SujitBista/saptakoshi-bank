import { apiClient, getApiBaseUrl } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import { formatFileSize, formatPolicyDate } from "@/features/policies/api";
import type {
  Circular,
  CircularFormValues,
  CircularListResponse,
  CircularResponse,
  CircularSearchFilters,
} from "@/features/circulars/types";

function buildSearchParams(filters: CircularSearchFilters): string {
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

export async function fetchCirculars(
  filters: CircularSearchFilters = {}
): Promise<CircularListResponse> {
  return apiClient<CircularListResponse>(`/api/circulars${buildSearchParams(filters)}`);
}

export async function fetchCircularById(id: number): Promise<Circular> {
  const response = await apiClient<CircularResponse>(`/api/circulars/${id}`);
  return response.circular;
}

export async function createCircular(values: CircularFormValues): Promise<Circular> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<CircularResponse>("/api/admin/circulars", {
    method: "POST",
    body: formData,
    token: getToken(),
  });

  return response.circular;
}

export async function updateCircular(id: number, values: CircularFormValues): Promise<Circular> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<CircularResponse>(`/api/admin/circulars/${id}`, {
    method: "PUT",
    body: formData,
    token: getToken(),
  });

  return response.circular;
}

export async function deleteCircular(id: number): Promise<void> {
  await apiClient<void>(`/api/admin/circulars/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}

export async function getCircularViewObjectUrl(id: number): Promise<string> {
  const response = await fetch(`${getApiBaseUrl()}/api/circulars/${id}/view`, {
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Unable to load circular PDF");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function formatCircularDate(value: string | null): string {
  return formatPolicyDate(value);
}

export { formatFileSize };

export function circularToFormValues(circular: Circular): CircularFormValues {
  return {
    title: circular.title,
  };
}
