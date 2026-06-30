import { apiClient, getApiBaseUrl } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import { formatFileSize, formatPolicyDate } from "@/features/policies/api";
import type {
  AmlTrainingMaterial,
  AmlTrainingMaterialFormValues,
  AmlTrainingMaterialListResponse,
  AmlTrainingMaterialResponse,
  AmlTrainingMaterialSearchFilters,
} from "@/features/aml-training-materials/types";

function buildSearchParams(filters: AmlTrainingMaterialSearchFilters): string {
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

export async function fetchAmlTrainingMaterials(
  filters: AmlTrainingMaterialSearchFilters = {}
): Promise<AmlTrainingMaterialListResponse> {
  return apiClient<AmlTrainingMaterialListResponse>(
    `/api/aml-training-materials${buildSearchParams(filters)}`
  );
}

export async function fetchAmlTrainingMaterialById(id: number): Promise<AmlTrainingMaterial> {
  const response = await apiClient<AmlTrainingMaterialResponse>(`/api/aml-training-materials/${id}`);
  return response.amlTrainingMaterial;
}

export async function createAmlTrainingMaterial(
  values: AmlTrainingMaterialFormValues
): Promise<AmlTrainingMaterial> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<AmlTrainingMaterialResponse>("/api/admin/aml-training-materials", {
    method: "POST",
    body: formData,
    token: getToken(),
  });

  return response.amlTrainingMaterial;
}

export async function updateAmlTrainingMaterial(
  id: number,
  values: AmlTrainingMaterialFormValues
): Promise<AmlTrainingMaterial> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<AmlTrainingMaterialResponse>(
    `/api/admin/aml-training-materials/${id}`,
    {
      method: "PUT",
      body: formData,
      token: getToken(),
    }
  );

  return response.amlTrainingMaterial;
}

export async function deleteAmlTrainingMaterial(id: number): Promise<void> {
  await apiClient<void>(`/api/admin/aml-training-materials/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}

export async function getAmlTrainingMaterialViewObjectUrl(id: number): Promise<string> {
  const response = await fetch(`${getApiBaseUrl()}/api/aml-training-materials/${id}/view`, {
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Unable to load AML training material PDF");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function formatAmlTrainingMaterialDate(value: string | null): string {
  return formatPolicyDate(value);
}

export { formatFileSize };

export function amlTrainingMaterialToFormValues(
  material: AmlTrainingMaterial
): AmlTrainingMaterialFormValues {
  return {
    title: material.title,
  };
}
