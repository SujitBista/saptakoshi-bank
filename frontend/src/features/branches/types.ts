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

export interface BranchListResponse {
  branches: Branch[];
}

export interface BranchResponse {
  branch: Branch;
}

export interface BranchSearchFilters {
  branchCode?: string;
  branchName?: string;
}

export interface BranchFormValues {
  branchCode: string;
  branchName: string;
  address: string;
  phoneNumber: string;
  email: string;
  status: "active" | "inactive";
}
