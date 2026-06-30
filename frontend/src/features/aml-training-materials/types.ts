export interface AmlTrainingMaterial {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AmlTrainingMaterialResponse {
  amlTrainingMaterial: AmlTrainingMaterial;
}

export interface AmlTrainingMaterialListResponse {
  data: AmlTrainingMaterial[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AmlTrainingMaterialSearchFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AmlTrainingMaterialFormValues {
  title: string;
  document?: FileList;
}

export const DEFAULT_AML_TRAINING_MATERIAL_PAGE = 1;
export const DEFAULT_AML_TRAINING_MATERIAL_PAGE_SIZE = 10;
export const AML_TRAINING_MATERIAL_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
