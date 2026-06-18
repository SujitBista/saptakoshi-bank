import { apiClient, getApiBaseUrl } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import type {
  AccountOpeningDocument,
  AccountOpeningDocumentListResponse,
  AccountOpeningDocumentResponse,
  AccountOpeningDocumentSearchFilters,
  AccountOpeningEditFormValues,
  AccountOpeningUploadFormValues,
} from "@/features/account-opening/types";

function buildSearchParams(filters: AccountOpeningDocumentSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.clientCode?.trim()) {
    params.set("client_code", filters.clientCode.trim());
  }

  if (filters.documentNo?.trim()) {
    params.set("document_no", filters.documentNo.trim());
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

export async function fetchAccountOpeningDocuments(
  filters: AccountOpeningDocumentSearchFilters = {}
): Promise<AccountOpeningDocumentListResponse> {
  return apiClient<AccountOpeningDocumentListResponse>(
    `/api/account-opening-documents${buildSearchParams(filters)}`,
    { token: getToken() }
  );
}

export async function fetchAccountOpeningDocumentById(
  id: number
): Promise<AccountOpeningDocument> {
  const response = await apiClient<AccountOpeningDocumentResponse>(
    `/api/account-opening-documents/${id}`,
    { token: getToken() }
  );

  return response.document;
}

export async function uploadAccountOpeningDocument(
  values: AccountOpeningUploadFormValues
): Promise<AccountOpeningDocument> {
  const formData = new FormData();
  formData.set("client_code", values.clientCode.trim());
  formData.set("first_name", values.firstName.trim());
  formData.set("last_name", values.lastName.trim());
  formData.set("father_name", values.fatherName.trim());
  formData.set("citizen_no", values.citizenNo.trim());
  formData.set("mobile_number", values.mobileNumber.trim());
  formData.set("file", values.file[0]);

  const response = await apiClient<AccountOpeningDocumentResponse>(
    "/api/account-opening-documents",
    {
      method: "POST",
      body: formData,
      token: getToken(),
    }
  );

  return response.document;
}

export async function updateAccountOpeningDocument(
  id: number,
  values: AccountOpeningEditFormValues
): Promise<AccountOpeningDocument> {
  const formData = new FormData();
  formData.set("first_name", values.firstName.trim());
  formData.set("last_name", values.lastName.trim());
  formData.set("father_name", values.fatherName.trim());
  formData.set("citizen_no", values.citizenNo.trim());
  formData.set("mobile_number", values.mobileNumber.trim());

  if (values.file && values.file.length > 0) {
    formData.set("file", values.file[0]);
  }

  const response = await apiClient<AccountOpeningDocumentResponse>(
    `/api/account-opening-documents/${id}`,
    {
      method: "PUT",
      body: formData,
      token: getToken(),
    }
  );

  return response.document;
}

async function fetchAccountOpeningDocumentFile(id: number): Promise<Response> {
  const token = getToken();
  const response = await fetch(
    `${getApiBaseUrl()}/api/account-opening-documents/${id}/file`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Unable to load document");
  }

  return response;
}

export async function getAccountOpeningDocumentFileObjectUrl(
  id: number
): Promise<string> {
  const response = await fetchAccountOpeningDocumentFile(id);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function downloadAccountOpeningDocument(id: number): Promise<void> {
  const response = await fetchAccountOpeningDocumentFile(id);
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");
  const fileNameMatch = disposition?.match(/filename="([^"]+)"/);
  const fileName = fileNameMatch?.[1]
    ? decodeURIComponent(fileNameMatch[1])
    : `document-${id}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function documentToEditFormValues(
  document: AccountOpeningDocument
): AccountOpeningEditFormValues {
  return {
    firstName: document.firstName,
    lastName: document.lastName,
    fatherName: document.fatherName ?? "",
    citizenNo: document.citizenNo,
    mobileNumber: document.mobileNumber,
  };
}

export function formatDocumentDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
