export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  branchId: number | null;
  branchCode: string | null;
  branchName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  data: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserResponse {
  user: User;
}

export const DEFAULT_USER_PAGE = 1;
export const DEFAULT_USER_PAGE_SIZE = 10;
export const USER_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export interface UserSearchFilters {
  search?: string;
  branchId?: number;
  role?: string;
  status?: "active" | "inactive" | "";
  page?: number;
  limit?: number;
}

export interface UserFormValues {
  fullName: string;
  username: string;
  email: string;
  password: string;
  branchId: string;
  role: "ADMIN" | "USER";
  status: "active" | "inactive";
}

export interface UserEditFormValues {
  fullName: string;
  username: string;
  email: string;
  branchId: string;
  role: "ADMIN" | "USER";
  status: "active" | "inactive";
}

export interface BranchOption {
  value: string;
  label: string;
}
