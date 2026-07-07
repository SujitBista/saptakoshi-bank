import type { AuthUser } from "@saptakoshi/shared";
import { apiClient } from "@/lib/api-client";
import { getToken } from "@/lib/auth";

interface ResetOwnPasswordResponse {
  user: AuthUser;
}

export async function resetOwnPassword(
  currentPassword: string,
  newPassword: string
): Promise<AuthUser> {
  const response = await apiClient<ResetOwnPasswordResponse>(
    "/api/admin/auth/reset-password",
    {
      method: "PATCH",
      token: getToken(),
      body: {
        currentPassword,
        newPassword,
      },
    }
  );

  return response.user;
}
