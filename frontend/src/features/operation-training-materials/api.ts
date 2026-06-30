import { apiClient, getApiBaseUrl } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import { formatFileSize, formatPolicyDate } from "@/features/policies/api";
import type {
  OperationTrainingMaterial,
  OperationTrainingMaterialFormValues,
  OperationTrainingMaterialListResponse,
  OperationTrainingMaterialResponse,
  OperationTrainingMaterialSearchFilters,
} from "@/features/operation-training-materials/types";

function buildSearchParams(filters: OperationTrainingMaterialSearchFilters): string {
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

export async function fetchOperationTrainingMaterials(
  filters: OperationTrainingMaterialSearchFilters = {}
): Promise<OperationTrainingMaterialListResponse> {
  return apiClient<OperationTrainingMaterialListResponse>(
    `/api/operation-training-materials${buildSearchParams(filters)}`
  );
}

export async function fetchOperationTrainingMaterialById(id: number): Promise<OperationTrainingMaterial> {
  const response = await apiClient<OperationTrainingMaterialResponse>(`/api/operation-training-materials/${id}`);
  return response.operationTrainingMaterial;
}

export async function createOperationTrainingMaterial(
  values: OperationTrainingMaterialFormValues
): Promise<OperationTrainingMaterial> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<OperationTrainingMaterialResponse>("/api/admin/operation-training-materials", {
    method: "POST",
    body: formData,
    token: getToken(),
  });

  return response.operationTrainingMaterial;
}

export async function updateOperationTrainingMaterial(
  id: number,
  values: OperationTrainingMaterialFormValues
): Promise<OperationTrainingMaterial> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<OperationTrainingMaterialResponse>(
    `/api/admin/operation-training-materials/${id}`,
    {
      method: "PUT",
      body: formData,
      token: getToken(),
    }
  );

  return response.operationTrainingMaterial;
}

export async function deleteOperationTrainingMaterial(id: number): Promise<void> {
  await apiClient<void>(`/api/admin/operation-training-materials/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}

export async function getOperationTrainingMaterialViewObjectUrl(id: number): Promise<string> {
  const response = await fetch(`${getApiBaseUrl()}/api/operation-training-materials/${id}/view`, {
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Unable to load Operation training material PDF");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function formatOperationTrainingMaterialDate(value: string | null): string {
  return formatPolicyDate(value);
}

export { formatFileSize };

export function operationTrainingMaterialToFormValues(
  material: OperationTrainingMaterial
): OperationTrainingMaterialFormValues {
  return {
    title: material.title,
  };
}
