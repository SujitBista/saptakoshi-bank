export interface RiskTrainingMaterial {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskTrainingMaterialResponse {
  riskTrainingMaterial: RiskTrainingMaterial;
}

export interface RiskTrainingMaterialListResponse {
  data: RiskTrainingMaterial[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RiskTrainingMaterialSearchFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface RiskTrainingMaterialFormValues {
  title: string;
  document?: FileList;
}

export const DEFAULT_RISK_TRAINING_MATERIAL_PAGE = 1;
export const DEFAULT_RISK_TRAINING_MATERIAL_PAGE_SIZE = 10;
export const RISK_TRAINING_MATERIAL_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
