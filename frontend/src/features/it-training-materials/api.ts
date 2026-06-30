import { apiClient, getApiBaseUrl } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import { formatFileSize, formatPolicyDate } from "@/features/policies/api";
import type {
  ItTrainingMaterial,
  ItTrainingMaterialFormValues,
  ItTrainingMaterialListResponse,
  ItTrainingMaterialResponse,
  ItTrainingMaterialSearchFilters,
} from "@/features/it-training-materials/types";

function buildSearchParams(filters: ItTrainingMaterialSearchFilters): string {
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

export async function fetchItTrainingMaterials(
  filters: ItTrainingMaterialSearchFilters = {}
): Promise<ItTrainingMaterialListResponse> {
  return apiClient<ItTrainingMaterialListResponse>(
    `/api/it-training-materials${buildSearchParams(filters)}`
  );
}

export async function fetchItTrainingMaterialById(id: number): Promise<ItTrainingMaterial> {
  const response = await apiClient<ItTrainingMaterialResponse>(`/api/it-training-materials/${id}`);
  return response.itTrainingMaterial;
}

export async function createItTrainingMaterial(
  values: ItTrainingMaterialFormValues
): Promise<ItTrainingMaterial> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<ItTrainingMaterialResponse>("/api/admin/it-training-materials", {
    method: "POST",
    body: formData,
    token: getToken(),
  });

  return response.itTrainingMaterial;
}

export async function updateItTrainingMaterial(
  id: number,
  values: ItTrainingMaterialFormValues
): Promise<ItTrainingMaterial> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<ItTrainingMaterialResponse>(
    `/api/admin/it-training-materials/${id}`,
    {
      method: "PUT",
      body: formData,
      token: getToken(),
    }
  );

  return response.itTrainingMaterial;
}

export async function deleteItTrainingMaterial(id: number): Promise<void> {
  await apiClient<void>(`/api/admin/it-training-materials/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}

export async function getItTrainingMaterialViewObjectUrl(id: number): Promise<string> {
  const response = await fetch(`${getApiBaseUrl()}/api/it-training-materials/${id}/view`, {
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Unable to load IT training material PDF");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function formatItTrainingMaterialDate(value: string | null): string {
  return formatPolicyDate(value);
}

export { formatFileSize };

export function itTrainingMaterialToFormValues(
  material: ItTrainingMaterial
): ItTrainingMaterialFormValues {
  return {
    title: material.title,
  };
}
