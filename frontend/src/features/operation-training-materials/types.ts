export interface OperationTrainingMaterial {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationTrainingMaterialResponse {
  operationTrainingMaterial: OperationTrainingMaterial;
}

export interface OperationTrainingMaterialListResponse {
  data: OperationTrainingMaterial[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OperationTrainingMaterialSearchFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface OperationTrainingMaterialFormValues {
  title: string;
  document?: FileList;
}

export const DEFAULT_OPERATION_TRAINING_MATERIAL_PAGE = 1;
export const DEFAULT_OPERATION_TRAINING_MATERIAL_PAGE_SIZE = 10;
export const OPERATION_TRAINING_MATERIAL_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
