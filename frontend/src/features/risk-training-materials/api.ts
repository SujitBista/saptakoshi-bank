import { apiClient, getApiBaseUrl } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import { formatFileSize, formatPolicyDate } from "@/features/policies/api";
import type {
  RiskTrainingMaterial,
  RiskTrainingMaterialFormValues,
  RiskTrainingMaterialListResponse,
  RiskTrainingMaterialResponse,
  RiskTrainingMaterialSearchFilters,
} from "@/features/risk-training-materials/types";

function buildSearchParams(filters: RiskTrainingMaterialSearchFilters): string {
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

export async function fetchRiskTrainingMaterials(
  filters: RiskTrainingMaterialSearchFilters = {}
): Promise<RiskTrainingMaterialListResponse> {
  return apiClient<RiskTrainingMaterialListResponse>(
    `/api/risk-training-materials${buildSearchParams(filters)}`
  );
}

export async function fetchRiskTrainingMaterialById(id: number): Promise<RiskTrainingMaterial> {
  const response = await apiClient<RiskTrainingMaterialResponse>(`/api/risk-training-materials/${id}`);
  return response.riskTrainingMaterial;
}

export async function createRiskTrainingMaterial(
  values: RiskTrainingMaterialFormValues
): Promise<RiskTrainingMaterial> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<RiskTrainingMaterialResponse>("/api/admin/risk-training-materials", {
    method: "POST",
    body: formData,
    token: getToken(),
  });

  return response.riskTrainingMaterial;
}

export async function updateRiskTrainingMaterial(
  id: number,
  values: RiskTrainingMaterialFormValues
): Promise<RiskTrainingMaterial> {
  const formData = new FormData();
  formData.set("title", values.title.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<RiskTrainingMaterialResponse>(
    `/api/admin/risk-training-materials/${id}`,
    {
      method: "PUT",
      body: formData,
      token: getToken(),
    }
  );

  return response.riskTrainingMaterial;
}

export async function deleteRiskTrainingMaterial(id: number): Promise<void> {
  await apiClient<void>(`/api/admin/risk-training-materials/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}

export async function getRiskTrainingMaterialViewObjectUrl(id: number): Promise<string> {
  const response = await fetch(`${getApiBaseUrl()}/api/risk-training-materials/${id}/view`, {
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Unable to load Risks training material PDF");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function formatRiskTrainingMaterialDate(value: string | null): string {
  return formatPolicyDate(value);
}

export { formatFileSize };

export function riskTrainingMaterialToFormValues(
  material: RiskTrainingMaterial
): RiskTrainingMaterialFormValues {
  return {
    title: material.title,
  };
}
