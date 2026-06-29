export interface Policy {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyResponse {
  policy: Policy;
}

export interface PolicyListResponse {
  data: Policy[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PolicySearchFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PolicyFormValues {
  title: string;
  document?: FileList;
}

export const DEFAULT_POLICY_PAGE = 1;
export const DEFAULT_POLICY_PAGE_SIZE = 10;
export const POLICY_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
