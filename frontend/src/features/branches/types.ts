export interface Branch {
  id: number;
  branchCode: string;
  branchName: string;
  address: string | null;
  phoneNumber: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BranchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BranchListResponse {
  branches: Branch[];
  pagination: BranchPagination;
}

export const DEFAULT_BRANCH_PAGE = 1;
export const DEFAULT_BRANCH_PAGE_SIZE = 10;

export interface BranchResponse {
  branch: Branch;
}

export interface BranchSearchFilters {
  branchCode?: string;
  branchName?: string;
  page?: number;
  limit?: number;
}

export interface BranchFormValues {
  branchCode: string;
  branchName: string;
  address: string;
  phoneNumber: string;
  email: string;
  status: "active" | "inactive";
}
