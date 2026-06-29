import type { ProductPaperCategory } from "@saptakoshi/shared";
import { apiClient, getApiBaseUrl } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import type {
  ProductPaper,
  ProductPaperFormValues,
  ProductPaperListResponse,
  ProductPaperResponse,
  ProductPaperSearchFilters,
} from "@/features/product-papers/types";

function buildSearchParams(filters: ProductPaperSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.category) {
    params.set("category", filters.category);
  }

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

export async function fetchProductPapers(
  filters: ProductPaperSearchFilters = {}
): Promise<ProductPaperListResponse> {
  return apiClient<ProductPaperListResponse>(
    `/api/product-papers${buildSearchParams(filters)}`
  );
}

export async function fetchAdminProductPapers(
  filters: ProductPaperSearchFilters = {}
): Promise<ProductPaperListResponse> {
  return fetchProductPapers(filters);
}

export async function fetchProductPaperById(id: number): Promise<ProductPaper> {
  const response = await apiClient<ProductPaperResponse>(`/api/product-papers/${id}`);
  return response.productPaper;
}

export async function createProductPaper(
  values: ProductPaperFormValues
): Promise<ProductPaper> {
  const formData = new FormData();
  formData.set("category", values.category);
  formData.set("title", values.title.trim());
  formData.set("description", values.description.trim());

  if (values.document?.[0]) {
    formData.set("document", values.document[0]);
  }

  const response = await apiClient<ProductPaperResponse>("/api/admin/product-papers", {
    method: "POST",
    body: formData,
    token: getToken(),
  });

  return response.productPaper;
}

export async function updateProductPaper(
  id: number,
  values: ProductPaperFormValues
): Promise<ProductPaper> {
  const response = await apiClient<ProductPaperResponse>(`/api/admin/product-papers/${id}`, {
    method: "PUT",
    body: {
      category: values.category,
      title: values.title.trim(),
      description: values.description.trim(),
    },
    token: getToken(),
  });

  return response.productPaper;
}

export async function deleteProductPaper(id: number): Promise<void> {
  await apiClient<void>(`/api/admin/product-papers/${id}`, {
    method: "DELETE",
    token: getToken(),
  });
}

export async function getProductPaperViewObjectUrl(id: number): Promise<string> {
  const response = await fetch(`${getApiBaseUrl()}/api/product-papers/${id}/view`, {
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Unable to load product paper PDF");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function formatProductPaperDate(value: string | null): string {
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

export function getProductPaperCategoryLabel(category: ProductPaperCategory): string {
  return category === "DEPOSIT" ? "Deposit" : "Credit";
}

export function productPaperToFormValues(productPaper: ProductPaper): ProductPaperFormValues {
  return {
    category: productPaper.category,
    title: productPaper.title,
    description: productPaper.description ?? "",
  };
}
