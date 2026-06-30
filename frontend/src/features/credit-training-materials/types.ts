export interface CreditTrainingMaterial {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTrainingMaterialResponse {
  creditTrainingMaterial: CreditTrainingMaterial;
}

export interface CreditTrainingMaterialListResponse {
  data: CreditTrainingMaterial[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreditTrainingMaterialSearchFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreditTrainingMaterialFormValues {
  title: string;
  document?: FileList;
}

export const DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE = 1;
export const DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE_SIZE = 10;
export const CREDIT_TRAINING_MATERIAL_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
