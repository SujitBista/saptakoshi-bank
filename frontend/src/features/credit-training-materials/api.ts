import { apiClient, getApiBaseUrl } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import { formatFileSize, formatPolicyDate } from "@/features/policies/api";
import type {
  CreditTrainingMaterial,
  CreditTrainingMaterialFormValues,
  CreditTrainingMaterialListResponse,
  CreditTrainingMaterialResponse,
  CreditTrainingMaterialSearchFilters,
} from "@/features/credit-training-materials/types";

function buildSearchParams(filters: CreditTrainingMaterialSearchFilters): string {
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

export async function fetchCreditTrainingMaterials(
  filters: CreditTrainingMaterialSearchFilters = {}
): Promise<CreditTrainingMaterialListResponse> {
  return apiClient<CreditTrainingMaterialListResponse>(
    `/api/credit-training-materials${buildSearchParams(filters)}`
  );
}

export async function fetchCreditTrainingMaterialById(id: number): Promise<CreditTrainingMaterial> {
  const response = await apiClient<CreditTrainingMaterialResponse>(`/api/credit-training-materials/${id}`);
  return response.creditTrainingMaterial;
}

export async function createCreditTrainingMaterial(
  values: CreditTrainingMaterialFormValues
): Promise<CreditTrainingMaterial> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<CreditTrainingMaterialResponse>("/api/admin/credit-training-materials", {
    method: "POST",
    body: formData,
    token: getToken(),
  });

  return response.creditTrainingMaterial;
}

export async function updateCreditTrainingMaterial(
  id: number,
  values: CreditTrainingMaterialFormValues
): Promise<CreditTrainingMaterial> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<CreditTrainingMaterialResponse>(
    `/api/admin/credit-training-materials/${id}`,
    {
      method: "PUT",
      body: formData,
      token: getToken(),
    }
  );

  return response.creditTrainingMaterial;
}

export async function deleteCreditTrainingMaterial(id: number): Promise<void> {
  await apiClient<void>(`/api/admin/credit-training-materials/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}

export async function getCreditTrainingMaterialViewObjectUrl(id: number): Promise<string> {
  const response = await fetch(`${getApiBaseUrl()}/api/credit-training-materials/${id}/view`, {
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Unable to load Credit training material PDF");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function formatCreditTrainingMaterialDate(value: string | null): string {
  return formatPolicyDate(value);
}

export { formatFileSize };

export function creditTrainingMaterialToFormValues(
  material: CreditTrainingMaterial
): CreditTrainingMaterialFormValues {
  return {
    title: material.title,
  };
}
