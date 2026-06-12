export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AdminLoginResponse {
  token: string;
  user: AdminUser;
}
