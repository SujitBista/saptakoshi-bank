import type { ProductPaperCategory } from "@saptakoshi/shared";

export interface ProductPaper {
  id: number;
  category: ProductPaperCategory;
  title: string;
  description: string | null;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPaperResponse {
  productPaper: ProductPaper;
}

export interface ProductPaperListResponse {
  data: ProductPaper[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductPaperSearchFilters {
  category?: ProductPaperCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductPaperFormValues {
  category: ProductPaperCategory;
  title: string;
  description: string;
  document?: FileList;
}

export const DEFAULT_PRODUCT_PAPER_PAGE = 1;
export const DEFAULT_PRODUCT_PAPER_PAGE_SIZE = 10;
export const PRODUCT_PAPER_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export const PRODUCT_PAPER_CATEGORY_OPTIONS = [
  { value: "DEPOSIT", label: "Deposit" },
  { value: "CREDIT", label: "Credit" },
] as const;
