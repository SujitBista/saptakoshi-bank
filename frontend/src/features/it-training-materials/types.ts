export interface ItTrainingMaterial {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItTrainingMaterialResponse {
  itTrainingMaterial: ItTrainingMaterial;
}

export interface ItTrainingMaterialListResponse {
  data: ItTrainingMaterial[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ItTrainingMaterialSearchFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ItTrainingMaterialFormValues {
  title: string;
  document?: FileList;
}

export const DEFAULT_IT_TRAINING_MATERIAL_PAGE = 1;
export const DEFAULT_IT_TRAINING_MATERIAL_PAGE_SIZE = 10;
export const IT_TRAINING_MATERIAL_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
