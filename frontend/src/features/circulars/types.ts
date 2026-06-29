export interface Circular {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CircularResponse {
  circular: Circular;
}

export interface CircularListResponse {
  data: Circular[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CircularSearchFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CircularFormValues {
  title: string;
  document?: FileList;
}

export const DEFAULT_CIRCULAR_PAGE = 1;
export const DEFAULT_CIRCULAR_PAGE_SIZE = 10;
export const CIRCULAR_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
