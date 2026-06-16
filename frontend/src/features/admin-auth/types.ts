export interface AdminUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  branchId: number | null;
  branchCode: string | null;
  branchName: string | null;
}

export interface AdminLoginResponse {
  token: string;
  user: AdminUser;
}
